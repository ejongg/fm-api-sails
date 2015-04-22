
var moment = require('moment');
var Promise = require("bluebird");

module.exports = {
	removeLoadout : function(delivery){
		return new Promise(function (resolve, reject){
			delivery.loadout_id = null;

			delivery.save(function(err, updatedDelivery){
				if(err) reject(err);

				resolve(updatedDelivery);
			});
		});
	},

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
				total_amount : order.total_amount,				
				customer_id : order.customer_id.id,
				order_id : order.id,
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