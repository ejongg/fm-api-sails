/**
 * Load_outController
 *
 * @description :: Server-side logic for managing load_outs
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

 var moment = require('moment');
 var Promise = require("bluebird");

module.exports = {
	add : function(req, res){

		var orders = req.body.orders;	
		var user = req.body.user;
		var flag = req.body.flag;
		var truckId = req.body.truck_id;	
		var loadoutNumber = req.body.loadout_no;
		var loadoutId = req.body.loadout_id;
		var deliveryDate = moment(req.body.delivery_date, 'YYYY-MM-DD').format('YYYY-MM-DD');

		if(!Array.isArray(orders)){
			orders = [orders];
		}

		var loadout = {
			loadout_number : loadoutNumber,
			date_created : deliveryDate,
			truck_id : truckId
		};

		Load_out.findOrCreate(loadout, loadout)
			.then(function (resultLoadout){
				return resultLoadout;
			})

			.then(function (resultLoadout){
				return new Promise(function (resolve){
					new Promise (function (resolve){
						resolve(orders);
					})

					.each(function (order){
						return DeliveryService.createDelivery(order, resultLoadout.id, loadoutNumber, truckId, deliveryDate, user)
					})

					.then(function (){
						resolve(resultLoadout);
					})
				});
			})

			.then(function (resultLoadout){

				LoadOutService.getDetails(resultLoadout).then(function (detailedLoadout){
					return new Promise(function (resolve){
						Trucks.findOne({id : detailedLoadout.truck_id}).populateAll()
							.then(function (foundTruck){
								detailedLoadout.truck_id = foundTruck;
							})

							.then(function (){
								resolve(detailedLoadout);
							})
					});									
				})

				.then(function (detailedLoadout){
					if(flag == "add"){
						sails.sockets.blast("loadout", {verb : "created", data : detailedLoadout});
						return res.send("Loadout successfully created", 200);	
					}else{
						sails.sockets.blast("loadout", {verb : "updated", data : detailedLoadout});
						return res.send("Loadout successfully updated", 200);	
					}
				})	
			})

			
	},

	getCompleteLoadouts : function (req, res){
		var date = req.query.date;
		var truckId = req.query.truck;

		var query = {
			date_created : date, 
			status : "Complete"
		};

		if(truckId){
			query = {
				date_created : date,
				truck_id : truckId, 
				status : "Complete"
			};
		}

		Load_out.find(query)
			.then(function (loadout){
				return res.send(loadout);
			})
	},

	confirm : function(req, res){
		var loadoutId = req.body.loadout_id;
		var truck = req.body.truck_id;
		var deliveryDate = req.body.delivery_date;

		Load_out.update({id : loadoutId}, {status : "In progress"})
			.then(function (updatedLoadout){
				return new Promise(function (resolve){
					LoadOutService.getDetails(updatedLoadout).then(function (detailedLoadout){
						sails.sockets.blast("loadout", {verb : "confirmed", data : detailedLoadout});
						resolve();
					})
				});
			})

			.then(function (){
				return Delivery_transactions.find({loadout_id : loadoutId, status : "To be delivered", delivery_date : deliveryDate});
			})

			.each(function (transaction){
				return Delivery_transactions.update({id : transaction.id}, {status : "On delivery"});
			})

			.then(function (){
				return res.send("Load out confirmed", 200);
			})
	},

	getInProgressLoadouts : function (req, res){
		var loadoutList = [];
		var date = req.query.date;
		var truckId = req.query.truck;

		Load_out.find({date_created : date, truck_id : truckId, status : {'like' : 'In progress'}})
			.then(function(loadouts){
				return loadouts;
			})

			.each(function (loadout){
				return new Promise(function (resolve, reject){
					LoadOutService.getDetails(loadout).then(function (detailedLoadout){
						loadoutList.push(detailedLoadout);
						resolve();
					})
				});
			})

			.then(function (){
				return res.send(loadoutList);
			})
	},

	list : function(req, res){
		var loadoutList = [];
		var date = req.query.date;
		var truckId = req.query.truck;

		if(!date){
			date = moment().format('YYYY-MM-DD');
		}

		var query = {
			date_created : date,
			status : {'like' : 'Pending'}
		};

		if(truckId){
			query = {
				date_created : date, 
				truck_id : truckId, 
				status : {'like' : 'Pending'}
			};
		}

		Load_out.find(query)
			.then(function(loadouts){
				return loadouts;
			})

			.each(function (loadout){
				return new Promise(function (resolve){
					LoadOutService.getDetails(loadout).then(function (detailedLoadout){
						return detailedLoadout;
					})

					.then(function (detailedLoadout){
						
						Trucks.findOne({id : loadout.truck_id})
							.then(function (foundTruck){
								detailedLoadout.truck_id = foundTruck;
								loadoutList.push(detailedLoadout);
								resolve();
							});
					})
				});
			})

			.then(function (){
				return res.send(loadoutList);
			})
	},

	getLoadOutProducts : function(req, res){
		var loadoutId = req.query.id;
		var productList = [];

		Delivery_transactions.find({loadout_id : loadoutId}).populateAll()
			.then(function (transactions){
				return transactions;
			})

			.each(function (transaction){
				return new Promise(function (resolve, reject){
					_(transaction.products).forEach(function (product){

						Sku.findOne({id : product.sku_id})
							.then(function (foundProduct){

								return SkuService.getProductName(foundProduct.id)
									.then(function (brandName){
										foundProduct.brand_name = brandName;
										product.sku_id = foundProduct;
									})

									.then(function (){
										return SkuService.getCompanyName(foundProduct.id);
									})

									.then(function (company){
										product.sku_id.company = company;
									})
							})

							.then(function (){
								productList.push(product);
								resolve();
							})
						
					});
				})
			})

			.then(function (){
				return res.send(productList); 
			})
	}
};

