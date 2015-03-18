/**
 * TrucksController
 *
 * @description :: Server-side logic for managing trucks
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	loadout : function(req, res){
		var orders = req.body.orders;
		var truck_id = req.body.truck_id;
		var user = req.body.user;
		var delivery_date = req.body.delivery_date;

		(orders).forEach(function(order){
			var delivery = {
				total_amount : order.total_amount,				
				customer_id : order.customer_id,
				delivery_date : delivery_date,
				truck_id : truck_id,
				order_id : order.order_id,
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

		Delivery_transactions.find({truck_id : truck, status : 'To be delivered'})
			.then(function getDeliveries(delivery_transactions){

				(delivery_transactions).forEach(function(transaction){

					Delivery_products.find({dtrans_id : transaction.id}).populate('sku_id')
						.then(function getDeliveryProducts(products){

							(products).forEach(function(product){
								InventoryService.LO_updateInventory(product.sku_id.id, product.cases, product.sku_id.bottlespercase);								
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

