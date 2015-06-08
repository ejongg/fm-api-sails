module.exports = function(req, res, next){
	var products = req.body.products;
	var notAvailableProducts = [];

	if(products.length == 0){
		return res.send({message : 'Invalid! No products sent.'}, 400);
	}
	
	async.each(products, function (product, cb){

		BaysService.findMovingPile(product.sku_id, function (err, bayResult){
			if(typeof bayResult == 'number'){

				Inventory.find({sku_id : product.sku_id, bay_id : bayResult})
					.then(function (foundSku){

						if(foundSku){
							var totalCaseCount = 0;

							_(foundSku).forEach(function (sku){
								totalCaseCount = totalCaseCount + sku.physical_count;
							});

							if(product.bottles > 0){
								product.cases  = product.cases + 1;
							}

							if(product.cases > totalCaseCount){
								SkuService.getSkuCompleteName(product.sku_id)
									.then(function (completeSkuName){
										notAvailableProducts.push(completeSkuName);
										cb();
									})								
							}else{
								cb();
							}

						}else{
							return res.send({message : product.sku_name + ' not found in current moving pile'}, 400);							
						}

					});	

			}else{
				return res.send({message : bayResult}, 400);
			}
		});

	}, function (err){
		if(err) return res.send(err);

		if(notAvailableProducts.length > 0){
			return res.send({message : 'Insufficient stocks in current moving pile', data : notAvailableProducts}, 400);
		}else{
			next();
		}
	});
}