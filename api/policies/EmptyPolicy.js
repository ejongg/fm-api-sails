var Promise = require('bluebird');

module.exports = function (req, res, next){
	var products = req.body.products;
	var notAvailable = [];


	new Promise(function (resolve){
		resolve(products);
	})

	.each(function (product){
		return new Promise(function (resolve){
			
			if(product.return_empties_cases > 0 || product.return_empties_bottles > 0){
				
				return EmptiesService.countBottlesAndCases(product.sku_id).then(function (result){
					
					if(result == -1){

						/* If product is not found in empties table */
						return SkuService.getSkuCompleteName(product.sku_id).then(function (completeName){
							notAvailable.push(completeName);
							resolve();
						});

					}else{
						if(product.return_empties_cases <= result.cases){

							if(product.return_empties_bottles <= result.bottles - (product.return_empties_cases * product.bottlespercase)){
								resolve();
							}else{
								return SkuService.getSkuCompleteName(product.sku_id).then(function (completeName){
									notAvailable.push(completeName);
									resolve();
								})
							}

						}else{
							return SkuService.getSkuCompleteName(product.sku_id).then(function (completeName){
								notAvailable.push(completeName);
								resolve();
							})
						}
					}
				})

			}else{
				resolve();
			}
		});
	})

	.then(function (){
		if(notAvailable.length > 0){
			return res.json({code : 0, message : 'Insufficient bottles in Empties Inventory', data : notAvailable}, 400);
		}else{
			next();
		}
	})
};