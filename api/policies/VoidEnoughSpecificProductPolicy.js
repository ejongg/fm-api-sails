var Promise = require('bluebird');

module.exports = function (req, res, next){
	var purchaseId = req.body.purchase_id;
	var unavailableProducts = [];

	Purchase_products.find({purchase_id : purchaseId})
		.then(function (products){
			return products;
		})

		.each(function (product){
			return new Promise(function (resolve){

				Inventory.findOne({sku_id : product.sku_id, bay_id : product.bay_id, prod_date : product.prod_date})
					.then(function (foundItem){
						
						if(product.cases > foundItem.physical_count){

							return SkuService.getSkuCompleteName(product.sku_id).then(function (skuCompleteName){
								unavailableProducts.push(skuCompleteName);
								resolve();
							});

						}else{
							resolve();
						}

					})
			});
			
		})

		.then(function (){
			if(unavailableProducts.length > 0){
				return res.send({message : "Some skus are unavaiable", data : unavailableProducts}, 400);
			}else{
				next();
			}
		})
};