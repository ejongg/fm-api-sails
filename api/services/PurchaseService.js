var Promise = require("bluebird");

module.exports = {
	createProducts : function (products, purchaseId){
		return new Promise(function (resolve, reject){
			
			function getProducts (){
				return new Promise(function (resolve, reject){
					resolve(products);
				});
			};

			getProducts()
				.each(function (product){
					return new Promise(function (resolve, reject){

						var purchaseProduct = {
							purchase_id : purchaseId,
							sku_id : product.sku_id,
							cases : product.cases,
							costpercase : product.costpercase,
							discountpercase : product.discountpercase,
							amount : product.amount
						};

						Purchase_products.create(purchaseProduct)
							.then(function (newProduct){
								return PurchaseService.addInInventory(product);															
							})

							.then(function (){
								if(product.empty_bottles > 0){
									return EmptiesService.deductEmptyBottles(product.sku_id, product.empty_bottles, product.bottlespercase);
								}								
							})

							.then(function (){
								resolve();
							})
					});
				})

				.then(function (){
					resolve();
				})
		});
	},

	addInInventory : function (product){
		Sku.findOne({id : product.sku_id})
			.then(function(sku){
				return sku.bottlespercase;
			})

			.then(function (bottlespercase){
				InventoryService.put(product.sku_id, product.cases, bottlespercase, product.bay_id, product.prod_date, product.lifespan);
			})
	}
};