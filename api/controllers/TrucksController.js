/**
 * TrucksController
 *
 * @description :: Server-side logic for managing trucks
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	add : function(req, res){
		var truck = {
		    driver : req.body.driver,
			dispatcher : req.body.dispatcher,
			agent : req.body.agent,
			helper : req.body.helper,
			route : req.body.route,
			carry_weight : req.body.carry_weight
		}

		Trucks.findOne(truck)
			.then(function(found_truck){
				if(found_truck){
					return res.send("You are entering a duplicate entry");
				}else{
					Trucks.create(truck).exec(function(err, created_truck){
						sails.sockets.blast('trucks', {verb : 'created', data : truck});
						return res.send(201);
					});
				}
			})

			.catch(function(err){
				console.log(err);
			});
	},

	loadout : function(req, res){
		var orders = req.body.orders;
		var truck_id = req.body.truck_id;
		var user = req.body.user;
		var delivery_date = req.body.delivery_date;

		(orders).forEach(function(order){
			var delivery = {
				total_amount : order.total_amount,				
				customer_id : order.customer_id.id,
				delivery_date : delivery_date,
				truck_id : truck_id,
				order_id : order.id,
				user : user	
			};

			Delivery_transactions.create(delivery)
				.then(function createDeliveryProducts(created_delivery){

					(order.products).forEach(function(product){
						var order_product = {
							dtrans_id : created_delivery.id,
							sku_id : product.sku_id,
							cases : product.cases
						};

						Delivery_products.create(order_product)
							.exec(function(err, created_product){});
					});

					return res.json({code : 1, message : "Delivery added"});

				},

				function(err){
					console.log(err);
				});

		});		
	},

	confirm_loadout : function(req, res){
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
				console.log(err);
			});
	}
};

