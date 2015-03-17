var async = require('async');

module.exports = function(req, res, next){
	var products = req.body.products;

	(products).forEach(function(product){

		Inventory.find({sku_id : product.sku_id})
			.then(function(skus){
				var warehouse_product_cases = 0;

				async.each(skus, function(sku, cb){
					warehouse_product_cases = warehouse_product_cases + sku.physical_count;
					cb();
				}, function(err){
					if(err)
						console.log(err);

				});

				return warehouse_product_cases;
			})

			.then(function(warehouse_product_cases){

				if(product.cases > warehouse_product_cases){
					return res.json({code : 0, message : 'Insufficient products in warehouse'});
				}

				next();
			})

	});
};