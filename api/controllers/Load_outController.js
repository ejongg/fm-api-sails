/**
 * Load_outController
 *
 * @description :: Server-side logic for managing load_outs
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	add : function(req, res){
		var orders = req.body.orders;
		var truck_id = req.body.truck_id;
		var user = req.body.user;
		var delivery_date = req.body.delivery_date;
		var loadoutNumber = req.body.loadout_no;

		var loadout = {
			load_number : loadoutNumber,
			date_created : moment().format('YYYY-MM-DD')
		};

		Load_out.create(loadout)
			.exec(function createLoadout(err, createdLoadout){
				if(err)
					return res.send(err);
			});

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
					return res.send(err);
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
	}
};

