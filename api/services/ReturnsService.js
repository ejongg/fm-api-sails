var Promise = require("bluebird");

module.exports = {
	getTotalAmount : function (products, callback){
		var totalAmount = 0;

		async.each(products, function (product, cb){

			Sku.findOne({id : product.sku_id})
				.then(function findSku(sku){
					return sku;
				})

				.then(function computeAmount(sku){
					totalAmount = totalAmount + (product.cases * sku.pricepercase);
					totalAmount = totalAmount + (product.bottles * sku.priceperbottle);						
					cb(); 
				})

		}, function (err){
			if(err) callback(err);

			callback(null, totalAmount);
		});
	}
};