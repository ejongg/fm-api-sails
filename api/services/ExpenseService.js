var Promise = require('bluebird');

module.exports = {
	voidBreakageAndSpoilage : function (expenseId){
		return new Promise(function (resolve){
			Expense_products.find({expense_id : expenseId})
				.then(function (expenseProducts){
					return expenseProducts;
				})

				.each(function (product){
					return new Promise(function (resolve){
						SkuService.getSkuDetails(product.sku_id)
							.then(function (detailedSku){
								product.sku_id = detailedSku;
								resolve();
							})
					});
				})

				.each(function (product){
					return InventoryService.put(product.sku_id.id, product.cases, product.sku_id.bottlespercase, product.bay_id, product.prod_date, product.sku_id.lifespan);
				})

				.then(function (){
					Expenses.findOne({id : expenseId})
						.then(function (foundExpense){
							resolve(foundExpense);
						})
				})
		});
	},

	voidEmpties : function(expenseId){
		return new Promise(function (resolve){

			Expense_products.find({expense_id : expenseId})
				.then(function (products){
					return products;
				})

				.each(function (product){
					return new Promise(function (resolve){
						SkuService.getSkuDetails(product.sku_id)
							.then(function (detailedSku){
								product.sku_id = detailedSku;
								resolve();
							})
					});
				})

				.each(function (product){
					return EmptiesService.put(product.sku_id.id, product.sku_id.bottlespercase, product.bottles, product.cases);
				})

				.then(function (){
					Expenses.findOne({id : expenseId})
						.then(function (foundExpense){
							resolve(foundExpense);
						})
				})
		});
	}
};