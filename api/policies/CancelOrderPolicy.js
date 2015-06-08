var Promise = require('bluebird');

module.exports = function (req, res, next){
	var orderId = req.body.order_id;

	Customer_order_products.find({order_id : orderId})
		.then(function (products){
			return products;
		})

		.each(function (product){
			return new Promise(function (resolve){
				SkuService.getCompanyName(product.sku_id).then(function (skuCompany){
					
					if(skuCompany == 'SMB'){
						BaysService.findMovingPile(product.sku_id, function (err, result){
							if(typeof result == 'number'){
								resolve();
							}else{
								return res.send({message : result}, 400);
							}
						});
					}else{
						resolve();
					}
					
				});
			});
		})

		.then(function (){
			next();
		})
};