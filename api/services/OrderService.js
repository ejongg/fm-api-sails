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
						order.status = "Complete";

						order.save(function (err, saved){
							console.log("Hello");
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