
var Promise = require('bluebird');
var moment = require('moment');

module.exports = {
	createWarehouseTransaction : function (customer, totalAmount, returnId, user, products){
		return new Promise(function (resolve){
			var transaction = {
				customer_name : customer,
				total_amount : totalAmount,
				return_id : returnId,
				user : user,
				date : moment().format("YYYY-MM-DD")
			};

			Warehouse_transactions.create(transaction)
				.then(function (createdTransaction){

					new Promise(function (resolve){
						resolve(products);
					})

					.each(function (product){
						return WarehouseServices.createWarehouseSalesProducts(product, createdTransaction.id);
					})

					.then(function (){
						resolve(createdTransaction);
					})

				})
		});
	},

	createWarehouseSalesProducts : function (product, transactionId){
		return new Promise(function (resolve){

			var salesProduct = {
				wtrans_id : transactionId,
				sku_id : product.sku_id,
				bottles : product.bottles,
				cases : product.cases,
				discountpercase : product.discountpercase
			};

			Warehouse_transaction_products.create(salesProduct)
				.then(function (){
					return InventoryService.deduct(product.sku_id, product.bottles, product.cases, product.bottlespercase);
				})

				.then(function (){
					resolve();
				})
		});
	}
};