var Promise = require("bluebird");

module.exports = {
	getProductName : function(skuId){
		return new Promise(function (resolve, reject){
			Sku.findOne({id : skuId})
				.then(function (sku){
					return sku;
				})

				.then(function (sku){
					return Products.findOne({id : sku.prod_id});
				})

				.then(function (product){
					resolve(product.brand_name);
				})
		});
	},

	getCompanyName : function(skuId){
		return new Promise(function (resolve, reject){
			Sku.findOne({id : skuId})
				.then(function (sku){
					return sku;
				})

				.then(function (sku){
					return Products.findOne({id : sku.prod_id});
				})

				.then(function (product){
					resolve(product.company);
				})
		});
	}
}