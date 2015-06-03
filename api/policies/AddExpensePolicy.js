
module.exports = function(req, res, next){
	var type = req.body.type;

	switch(type){
		case "Breakage":
			checkInventory();
			break;

		case "Spoilage":
			checkInventory();
			break;

		case "Broken Empties":
			checkEmpties();
			break;

		default :
			next();
	};

	function checkEmpties () {
		var products = req.body.empties;
		var notAvailableEmpties = [];

		if(products.length == 0){
			return res.send({message : 'Invalid! No products sent.'}, 400);
		}

		new Promise(function (resolve){
			resolve(products);
		})

		.each(function (product){
			Empties.find({sku_id : product.sku_id})
				.then(function (foundEmpties){
					if(foundEmpties){
						var totalCount = 0;

						_(foundEmpties).forEach(function (empty){
							totalCount = totalCount + empty.cases;
						});

						if(product.bottles > 0){
							product.cases  = product.cases + 1;
						}

						if(product.cases > totalCount){
							SkuService.getSkuCompleteName(product.sku_id)
								.then(function (skuCompleteName){
									notAvailableProducts.push(skuCompleteName);
									cb();
								})
						}else{
							cb();
						}

					}else{
						return res.send({message : product.sku_name + ' not found in Empties'}, 400);							
					}
				})
		})

		.then(function (){

			if(notAvailableProducts.length > 0){
				return res.send({message : 'Insufficient stocks in Empties', data : notAvailableProducts}, 400);
			}else{
				next();
			}

		})
	}

	function checkInventory () {
		var products = req.body.products;
		var notAvailableProducts = [];

		if(products.length == 0){
			return res.send({message : 'Invalid! No products sent.'}, 400);
		}
		
		async.each(products, function (product, cb){

			Inventory.find({sku_id : product.sku_id, bay_id : product.bay_id})
				.then(function (foundSku){
					if(foundSku){
						var totalCount = 0;

						_(foundSku).forEach(function (sku){
							totalCount = totalCount + sku.physical_count;
						});

						if(product.bottles > 0){
							product.cases  = product.cases + 1;
						}

						if(product.cases > totalCount){
							SkuService.getSkuCompleteName(product.sku_id)
								.then(function (skuCompleteName){
									notAvailableProducts.push(skuCompleteName);
									cb();
								})
						}else{
							cb();
						}

					}else{
						return res.send({message : product.sku_name + ' not found in Line' + product.bay_id}, 400);							
					}
				});	

		}, function (err){
			if(err) return res.send(err);

			if(notAvailableProducts.length > 0){
				return res.send({message : 'Insufficient stocks in Line', data : notAvailableProducts}, 400);
			}else{
				next();
			}
		});
	};
	
};