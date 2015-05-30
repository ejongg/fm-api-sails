
module.exports = function(req, res, next){
	var type = req.body.type;

	if(type == "Breakage" || type == "Spoilage"){
		checkInventory();
	}else{
		next();
	}

	function checkInventory() {
		var products = req.body.products;
		var notAvailableProducts = [];

		if(products.length == 0){
			return res.json({code : 0, message : 'Invalid! No products sent.'});
		}
		
		async.each(products, function (product, cb){

			Inventory.find({sku_id : product.sku_id, bay_id : product.bay_id})
				.exec(function (err, found_sku){
					if(found_sku){
						var sku_total_case_count = 0;

						_(found_sku).forEach(function (sku){
							sku_total_case_count = sku_total_case_count + sku.physical_count;
						});

						if(product.bottles > 0){
							product.cases  = product.cases + 1;
						}

						if(product.cases > sku_total_case_count){
							notAvailableProducts.push(product);
							cb();
						}else{
							cb();
						}

					}else{
						return res.json({code : 0, message : product.sku_name + ' not found in Bay' + product.bay_id});							
					}
				});	

		}, function (err){
			if(err) return res.send(err);

			if(notAvailableProducts.length > 0){
				return res.json({code : 0, message : 'Insufficient stocks in Bay', data : notAvailableProducts}, 400);
			}else{
				next();
			}
		});
	};
	
};