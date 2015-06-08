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

		var createdLoadout;

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
				LoadOutService.getDetails(resultLoadout)
					.then(function(detailedLoadout){
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

	confirm : function(req, res){
		var loadoutId = req.body.loadout_id;
		var truck = req.body.truck_id;
		var delivery_date = req.body.delivery_date;

		Load_out.findOne({id : loadoutId})
			.then(function (loadout){
				return new Promise(function (resolve){
					loadout.status = "In progress";

					loadout.save(function (err, saved){
						LoadOutService.getDetails(loadout)
							.then(function (detailedLoadout){
								sails.sockets.blast("loadout", {verb : "confirmed", data : detailedLoadout});
								resolve();
							})
					});
				});

			})

			.then(function (){
				return Delivery_transactions.find({truck_id : truck, status : "To be delivered", delivery_date : delivery_date});
			})

			.each(function (transaction){
				return new Promise(function (resolve, reject){
					Delivery_products.find({dtrans_id : transaction.id}).populate('sku_id')
						.then(function getDeliveryProducts(products){
							return products;
						})

						.each(function (product){
							return LoadOutService.deductInInventory(product);
						})

						.then(function (){
							resolve();
						})
				});
			})

			.each(function (transaction){
				return new Promise(function (resolve, reject){
					transaction.status = "On delivery";

					transaction.save(function(err, saved){
						resolve();
					});
				});
			})

			.then(function (){
				return res.send("Load out confirmed", 200);
			})
	},

	list : function(req, res){
		var loadoutList = [];

		Load_out.find({status : {'like' : 'Pending'}})
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

