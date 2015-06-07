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
							amount : product.amount,
							prod_date : product.prod_date,
							bay_id : product.bay_id
						};

						Purchase_products.create(purchaseProduct)
							.then(function (newProduct){
								return PurchaseService.addInInventory(product);															
							})

							.then(function (){
								if(product.return_empties_cases > 0 || product.return_empties_bottles > 0){
									return EmptiesService.deduct(product.sku_id, product.return_empties_cases, product.return_empties_bottles, product.bottlespercase);
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