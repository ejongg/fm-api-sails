
var moment = require('moment');
var Promise = require("bluebird");

module.exports = {
	createDeliveryProducts : function(deliveryId, product){
		return new Promise(function (resolve, reject){
			var orderProduct = {
				dtrans_id : deliveryId,
				sku_id : product.sku_id,
				cases : product.cases
			};

			Delivery_products.create(orderProduct)
				.then(function (deliveryProduct){
					resolve();
				})
		});
	},

	createDelivery : function(order, loadoutId, loadoutNumber, truckId, deliveryDate, user){
		return new Promise(function (resolve, reject){

			var delivery = {
				total_amount : order.order.total_amount,				
				customer_id : order.order.customer_id.id,
				order_id : order.order.id,
				loadout_id : loadoutId,
				loadout_number : loadoutNumber,
				delivery_date : deliveryDate,
				truck_id : truckId,
				user : user	
			};

			Delivery_transactions.create(delivery)
				.then(function (createdDelivery){
					return createdDelivery;
				})

				.then(function (createdDelivery){
					return new Promise(function (resolve, reject){
						async.each(order.products, function (product, cb){
							DeliveryService.createDeliveryProducts(createdDelivery.id, product)
								.then(function (){
									cb();
								})
						},

						function (err){
							resolve(createdDelivery);
						});
					});
				})

				.then(function (createdDelivery){
					resolve(createdDelivery);
				})
		});
	}
};