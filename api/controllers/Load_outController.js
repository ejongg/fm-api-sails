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
		var truckId = req.body.truck_id;
		var user = req.body.user;
		var deliveryDate = moment(req.body.delivery_date, 'YYYY-MM-DD').format('YYYY-MM-DD');
		var loadoutNumber = req.body.loadout_no;
		var loadoutId = req.body.loadout_id;
		var flag = req.body.flag;

		var loadout = {
			loadout_number : loadoutNumber,
			date_created : deliveryDate,
			truck_id : truckId
		};

		Load_out.findOrCreate(loadout, loadout)
			.then(function (createdLoadout){
				return createdLoadout;
			})

			.then(function (createdLoadout){
				return new Promise(function (resolve, reject){

					async.each(orders, function(order, cb){

						DeliveryService.createDelivery(order, createdLoadout.id, loadoutNumber, truckId, deliveryDate, user)
							.then(function (createdDelivery){
								Customer_orders.update({id : order.id}, {delivery_id : createdDelivery.id})
									.then(function (updatedOrder){
										sails.sockets.blast("customer_orders", {verb : "created", data : "updatedOrder"});
										cb();
									})
							})

					},

					function (err){
						resolve(createdLoadout);
					});				
				});
			})

			.then(function (createdLoadout){
				LoadOutService.getDetails(createdLoadout)
					.then(function(detailedLoadout){

						if(flag == "add"){
							sails.sockets.blast("loadout", {verb : "created", data : createdLoadout});	
						}else{
							sails.sockets.blast("loadout", {verb : "updated", data : createdLoadout});
						}
						
						return res.send("Loadout successfully added");
					})	
			})
	},

	confirm : function(req, res){
		var truck = req.body.truck_id;
		var delivery_date = req.body.delivery_date;

		Delivery_transactions.find({truck_id : truck, status : "To be delivered", delivery_date : delivery_date})
			.then(function getDeliveries(delivery_transactions){

				(delivery_transactions).forEach(function(transaction){

					Delivery_products.find({dtrans_id : transaction.id}).populate('sku_id')
						.then(function getDeliveryProducts(products){

							(products).forEach(function(product){
								InventoryService.LO_deduct(product.sku_id.id, product.cases, product.sku_id.bottlespercase);								
							});

						});

					transaction.status = "On delivery";
					transaction.save(function(err, saved){});

					return res.json({code : 1, message : "Load out confirmed"});
				});

			},

			function(err){
				return res.send(err);
			});
	},

	list : function(req, res){
		var loadoutList = [];

		Load_out.find()
			.then(function(loadouts){
				return loadouts;
			})

			.each(function (loadout){
				return new Promise(function (resolve, reject){
					LoadOutService.getDetails(loadout)
						.then(function (detailedLoadout){
							loadoutList.push(detailedLoadout);
							resolve();
						})
				});
			})

			.then(function (){
				return res.send(loadoutList);
			})
	}
};

