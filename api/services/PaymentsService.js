var Promise = require('bluebird');

module.exports = {
	getDetails : function (delivery){
		return new Promise(function (resolve){
			ReturnsService.getReturnsAmount(delivery.returns_id.id, delivery.returns_id.deposit)
				.then(function (returnsAmount){
					delivery.returns_amount = returnsAmount;
				})

				.then(function (){
					return Customer_orders.findOne({delivery_id : delivery.id});
				})

				.then(function (foundOrder){
					delivery.order_amount = foundOrder.total_amount;
				})

				.then(function (){
					return LoadInService.getLoadinAmount(delivery.id);
				})

				.then(function (loadinAmount){
					delivery.loadin_amount = loadinAmount;
					resolve(delivery);
				})
		});
	}
};