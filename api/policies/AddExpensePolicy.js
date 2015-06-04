var Promise = require('bluebird');

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
		var empties = req.body.empties;
		var notAvailableEmpties = [];

		if(empties.length == 0){
			return res.send({message : 'Invalid! No empties sent.'}, 400);
		}

		new Promise(function (resolve){
			resolve(empties);
		})

		.each(function (empty){
			return new Promise(function (resolve){
				EmptiesService.countBottlesAndCases(empty.sku_id).then(function (result){

					if(empty.return_empties_cases < result.cases){

						if(empty.return_empties_bottles < result.bottles){
							resolve();

						}else{
							return SkuService.getSkuCompleteName(empty.sku_id).then(function (completeName){
								notAvailableEmpties.push(completeName);
								resolve();
							})

						}

					}else{

						return SkuService.getSkuCompleteName(empty.sku_id).then(function (completeName){
							notAvailableEmpties.push(completeName);
							resolve();
						})
					}

				})
			});
		})

		.then(function (){

			if(notAvailableEmpties.length > 0){
				return res.send({message : 'Insufficient stocks in Empties', data : notAvailableEmpties}, 400);
			}else{
				next();
			}

		})
	}

	function checkInventory () {
		var products = req.body.products;
		var notAvailableProducts = [];
		var notFoundInLine = [];

		if(products.length == 0){
			return res.send({message : 'Invalid! No products sent.'}, 400);
		}
		
		async.each(products, function (product, cb){

			Inventory.find({sku_id : product.sku_id, bay_id : product.bay_id, prod_date : product.prod_date})
				.then(function (foundSku){
					if(foundSku.length > 0){
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
						SkuService.getSkuCompleteName(product.sku_id)
							.then(function (completeName){
								return completeName;
							})

							.then(function (completeName){
								return Bays.findOne({id : product.bay_id}).then(function (bay){
									return [completeName, bay.bay_name];
								})
							})

							.spread(function (completeName, bayName){
								notFoundInLine.push({sku : completeName, prod_date : product.prod_date, line : bayName});
								cb();
							})						
					}
				});	

		}, function (err){
			if(err) return res.send(err);

			if(notAvailableProducts.length > 0){
				return res.send({message : 'Insufficient stocks in Line', data : notAvailableProducts}, 400);

			}else if(notFoundInLine.length > 0){
				return res.send({message : 'Products not found in line', data : notFoundInLine}, 400);

			}else{
				next();
			}
		});
	};
	
};