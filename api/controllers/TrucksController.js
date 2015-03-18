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

		(orders).forEach(function(order){
			var delivery = {
				total_amount : order.total_amount,
				delivery_date : order.delivery_date,
				customer_id : order.customer_id,
				truck_id : truck_id,
				order_id : order.order_id,
				user : user	
			};

			Delivery_transaction.create(delivery)
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

				},

				function(err){
					console.log(err);
				});

		});		
	}
};

