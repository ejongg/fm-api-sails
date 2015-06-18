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
		var deliveryDate = moment(req.body.delivery_date, 'YYYY-MM-DD').format('YYYY-MM-DD');
		var maxWeight = req.body.carry_weight;
		var loadoutId = null;

		if(!Array.isArray(orders)){
			orders = [orders];
		}

		var findLoadout = {
			loadout_number : loadoutNumber,
			date_created : deliveryDate,
			truck_id : truckId
		};

		var loadout = {
			loadout_number : loadoutNumber,
			date_created : deliveryDate,
			truck_id : truckId,
			max_weight : maxWeight
		};

		Load_out.findOrCreate(findLoadout, loadout)
			.then(function (resultLoadout){
				loadoutId = resultLoadout.id;
				return resultLoadout;
			})

			.then(function (resultLoadout){
				return new Promise(function (resolve){
					new Promise (function (resolve){
						resolve(orders);
					})

					.each(function (order){
						return DeliveryService.createDelivery(order, resultLoadout.id, loadoutNumber, truckId, deliveryDate, user);
					})

					.each(function (order){
						return LoadOutService.addWeight(loadoutId, order.productslist);
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

			.each(function (transaction){
				return new Promise(function (resolve){
					Customer_orders.update({delivery_id : transaction.id}, {status : "On delivery"})
						.then(function (updatedOrder){
							return Customer_orders.findOne({id : updatedOrder[0].id}).populateAll()
						})

						.then(function (detailedOrder){
							sails.sockets.blast('customer_orders', {verb : "updated", data : detailedOrder});
							resolve();
						})
				});
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

		Delivery_transactions.find({loadout_id : loadoutId}).populate('products').populate('customer_id')
			.then(function (transactions){
				return transactions;
			})

			.each(function (transaction){
				return getProducts(transaction);
			})

			.then(function (){
				return res.send(productList); 
			})

		function getProducts(transaction){
			return new Promise(function (resolve){

				new Promise(function (resolve){
					resolve(transaction.products);
				})

				.each(function (product){

					var index = _.findIndex(productList, {'sku_id' : product.sku_id});
					
					if(index == -1){
						return new Promise(function (resolve){
							SkuService.getSkuDetails(product.sku_id).then(function (detailedProduct){
								detailedProduct.prod_date = product.prod_date;
								product.sku = detailedProduct;
								productList.push(product);
								resolve();
							})
						});	
					}else{
						productList[index].cases = productList[index].cases + product.cases;
					}
					
				})

				.then(function (){
					resolve();
				})

			});
		};
	}
};

