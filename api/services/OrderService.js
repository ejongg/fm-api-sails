var Promise = require('bluebird');

module.exports = {
	completeOrders : function (deliveryId){
		return new Promise(function (resolve, reject){
			
			Customer_orders.find({delivery_id : deliveryId})
				.then(function (orders){
					return orders;
				})

				.each(function (order){
					return new Promise(function (resolve, reject){
						order.status = "Delivered";

						order.save(function (err, saved){
							resolve();
						});
					});
				})

				.then(function (){
					resolve();
				})
		});
	}
};