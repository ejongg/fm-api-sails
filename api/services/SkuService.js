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
	},

	getSkuDetails: function(skuId){
		return new Promise(function (resolve, reject){
			Sku.findOne({id : skuId}).populate('prod_id')
				.then(function (sku){
					resolve(sku);
				})
		});
	},

	getLifespan : function(skuId){
		return new Promise(function (resolve, reject){
			Sku.findOne({id : skuId})
				.then(function (sku){
					resolve(sku.lifespan);
				})
		});
	},

	addDetails : function(item){
		return new Promise(function (resolve, reject){
			Sku.findOne({id : item.sku_id}).populate('prod_id')
				.then(function (foundSku){

					item.company = foundSku.prod_id.company;
					item.brand_name = foundSku.prod_id.brand_name;
					item.sku_name = foundSku.sku_name;
					item.size = foundSku.size;

					resolve(item);
				});
		})
	}
}