var Promise = require("bluebird");

module.exports = {
	createBadOrderProducts : function (products , badOrderId){
		return new Promise(function (resolve, reject){

			function getProducts(){
				return new Promise(function (resolve, reject){
					resolve(products);
				})
			};

			getProducts()
				.each(function (product){
					return BadOrdersService.createProducts(product, badOrderId);
				})

				.then(function (){
					resolve(badOrderId);
				})				
		});
	},

	createProducts : function (product, badOrderId){
		return new Promise(function (resolve, reject){
			var badOrderItem = {
				bad_order_id : 	badOrderId,
				sku_id : product.sku_id,
				bottles : product.bottles,
				cases : product.cases,
				reason : product.reason
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