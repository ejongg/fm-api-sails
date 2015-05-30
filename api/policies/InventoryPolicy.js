module.exports = function(req, res, next){
	var products = req.body.products;
	var notAvailableProducts = [];

	if(products.length == 0){
		return res.json({code : 0, message : 'Invalid! No products sent.'});
	}
	
	async.each(products, function (product, cb){

		BaysService.findMovingPile(product.company, function(err, bay_result){
			if(typeof bay_result == 'number'){

				Inventory.find({sku_id : product.sku_id, bay_id : bay_result})
					.exec(function (err, found_sku){
						if(found_sku){
							var totalCaseCount = 0;

							_(found_sku).forEach(function (sku){
								totalCaseCount = totalCaseCount + sku.physical_count;
							});

							if(product.bottles > 0){
								product.cases  = product.cases + 1;
							}

							if(product.cases > totalCaseCount){
								notAvailableProducts.push(product.sku_name);
								cb();
							}else{
								cb();
							}

						}else{
							return res.json({code : 0, message : product.sku_name + ' not found in current moving pile'});							
						}
					});	

			}else{
				return res.json({code : 0, message : bay_result});
			}
		});

	}, function (err){
		if(err) return res.send(err);

		if(notAvailableProducts.length > 0){
			return res.json({code : 0, message : 'Insufficient stocks in current moving pile', data : notAvailableProducts}, 400);
		}else{
			next();
		}
	});
}