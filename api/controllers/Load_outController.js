/**
 * Load_outController
 *
 * @description :: Server-side logic for managing load_outs
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

 var moment = require('moment');

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

					LoadOutService.getDeliveries(createdLoadout.id)
						.then(function (deliveries){
							createdLoadout.deliveries = deliveries;		
						})
						
						.then(function (){
							console.log(createdLoadout);
							sails.sockets.blast("loadout", {verb : "created", data : createdLoadout});
							return res.send("Loadout successfully added");
						})					
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

		Load_out.find().populate('deliveries')
			.then(function(loadouts){

			async.each(loadouts, function(loadout, cb){
				loadout.total_amount = 0;

				_(loadout.deliveries).forEach(function(delivery){
					loadout.total_amount = loadout.total_amount + delivery.total_amount;
				});
				
				loadoutList.push(loadout);
				cb();
			},

			function(err){
				if(err) return res.send(err);

				return res.send(loadoutList);
			});

		});
	}
};

