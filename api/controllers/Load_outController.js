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
		var truck_id = req.body.truck_id;
		var user = req.body.user;
		var delivery_date = req.body.delivery_date;
		var loadoutNumber = req.body.loadout_no;

		var loadout = {
			loadout_number : loadoutNumber,
			date_created : moment(delivery_date, 'YYYY-MM-DD').format('YYYY-MM-DD')
		};

		Load_out.create(loadout)
			.then(function createLoadout(createdLoadout){
				return createdLoadout;
			})

			.then(function createDelivery(createdLoadout){
				async.each(orders, function(order, cb){
					var delivery = {
						total_amount : order.total_amount,				
						customer_id : order.customer_id.id,
						delivery_date : delivery_date,
						truck_id : truck_id,
						order_id : order.id,
						loadout_number : loadoutNumber,
						loadout_id : createdLoadout.id,
						user : user	
					};

					Delivery_transactions.create(delivery)
						.then(function createDeliveryProducts(created_delivery){

							async.each(order.products, function(product, cb_inner){
								var order_product = {
									dtrans_id : created_delivery.id,
									sku_id : product.sku_id,
									cases : product.cases
								};

								Delivery_products.create(order_product)
									.exec(function(err, created_product){
										if(err)
											return res.send(err);

										cb_inner();
									});

							}, 

							function(err){
								if(err)
									return res.send(err);

								cb();
							});
						});
				},

				function(err){
					if(err) return res.send(err);

					sails.sockets.blast("loadout", {verb : "created", data : createdLoadout});
					return res.send("Loadout successfully added");					
				});
			});
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
					var total_amount = 0;

					Delivery_transactions.find({loadout_id : loadout.id}).populate("customer_id")
						.then(function (transactions){
							loadout.transactions = transactions;
							return transactions;
						})

						.each(function (transaction){
							total_amount = total_amount + transaction.total_amount;		
						})

						.then(function (){
							loadout.total_amount = total_amount;
						})

						.then(function (){
							loadoutList.push(loadout);
							resolve();
						})
				});
			})

			.then(function (){
				return res.send(loadoutList);
			})
	}
};

