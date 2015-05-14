var Promise = require('bluebird');
var moment = require('moment');

module.exports = {
	createBadOrder : function (expense, accountable, products){
		return new Promise(function (resolve){
			var badOrder = {
				expense : expense,
				accountable : accountable,
				date : moment().format('YYYY-MM-DD')
			};

			Bad_orders.create(badOrder)
				.then(function (createdBadOrder){

					new Promise(function (resolve){
						resolve(products);
					})

					.each(function (product){
						return BadOrdersService.createBadOrderProduct(product, createdBadOrder.id);
					})

					.then(function (){
						resolve(createdBadOrder);
					})
				})
		});
	},

	createBadOrderProduct : function (product, badOrderId){
		return new Promise(function (resolve){

			var badOrderItem = {
				bad_order_id : 	badOrderId,
				sku_id : product.sku_id,
				bottles : product.bottles,
				cases : product.cases,
				reason : product.reason
			};

			if(product.bottles > 0){
				badOrderItem.cases = badOrderItem.cases - 1;
			};

			Bad_order_details.create(badOrderItem)
				.then(function (createdProduct){
					return InventoryService.deductInSpecificBay(product.sku_id, product.bottles, product.cases, product.bottlespercase, product.bay_id);
				})

				.then(function (){
					resolve();
				})		
		});
	}
};