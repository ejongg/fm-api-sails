
var Promise = require('bluebird');
var moment = require('moment');

module.exports = {
	createReturns : function (returns, deposit){
		return new Promise(function (resolve){

			Returns.create({return_date : moment().format('YYYY-MM-DD'), deposit : deposit})
				.then(function (createdReturn){
					
					if(returns){

						new Promise(function (resolve){
							resolve(returns);
						})

						.each(function (product){
							return ReturnsService.createReturnsProduct(product, createdReturn.id);
						})
						
						.then(function (){
							resolve(createdReturn.id);
						})

					}else{
						resolve(createdReturn.id);
					}	
				})
		});
	},

	createReturnsProduct : function (product, returnId){
		return new Promise(function (resolve){
			var item = {
				return_id : returnId,
				sku_id : product.sku_id,
				bottles : product.bottles,
				cases : product.cases
			};

			Returns_products.create(item)
				.then(function (){
					return EmptiesService.put(product.sku_id, product.bottlespercase, product.bottles, product.cases);
				})

				.then(function (){
					resolve();
				})
		});
	},

	getTotalAmount : function (products, callback){
		var totalAmount = 0;

		async.each(products, function (product, cb){

			Sku.findOne({id : product.sku_id})
				.then(function findSku(sku){
					return sku;
				})

				.then(function computeAmount(sku){
					totalAmount = totalAmount + (product.bottles * sku.priceperbottle);						
					cb(); 
				})

		}, function (err){
			if(err) callback(err);

			callback(null, totalAmount);
		});
	},

	getReturnsAmount : function (returnId, deposit){
		return new Promise(function (resolve){
			var totalAmount = deposit;

			Returns_products.find({return_id : returnId})
				.then(function (foundProducts){
					return foundProducts;
				})

				.each(function (product){
					return new Promise(function (resolve){

						Sku.findOne({id : product.sku_id})
							.then(function findSku(sku){
								return sku;
							})

							.then(function computeAmount(sku){
								totalAmount = totalAmount + (product.bottles * sku.priceperempty);
								totalAmount = totalAmount + ((product.cases * sku.bottlespercase) *sku.pricepercase);						
								resolve();
							})
					});
				})

				.then(function (){
					resolve(totalAmount);
				})
		});
	}
};