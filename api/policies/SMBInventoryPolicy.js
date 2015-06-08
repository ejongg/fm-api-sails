var Promise = require('bluebird');

module.exports = function(req, res, next){
	var orders = req.body.orders;
	var notAvailable = [];

	new Promise(function (resolve){
		resolve(orders);
	})
	.each(function (order){
		return new Promise(function (resolve, reject){
			SkuService.getCompanyName(order.sku_id).then(function (company){
				if(company == 'SMB'){

					BaysService.findMovingPile(order.sku_id, function(err, bayResult){
						if(typeof bayResult == 'number'){

							Inventory.find({sku_id : order.sku_id, bay_id : bayResult}).sort('exp_date ASC')
								.then(function (foundSku){

									if(foundSku){
										var totalCaseCount = 0;

										_(foundSku).forEach(function (sku){
											totalCaseCount = totalCaseCount + sku.physical_count;
										});

										if(order.bottles > 0){
											order.cases  = order.cases + 1;
										}

										if(order.cases > totalCaseCount){
											SkuService.getSkuCompleteName(order.sku_id)
												.then(function (skuCompleteName){
													notAvailable.push(skuCompleteName);
													resolve();
												})
											
										}else{
											order.prod_date = foundSku[0].prod_date;
											resolve();
										}

									}else{
										return res.send({message : order.sku_name + ' not found in current moving pile'}, 400);							
									}

								});	

						}else{
							return res.send({message : bayResult}, 400);
						}
					});
					
				}else{
					resolve();
				}
			})
		});
	})

	.then(function (){
		if(notAvailable.length > 0){
			return res.send({message : 'Insufficient stocks in current moving pile', data : notAvailable}, 400);
		}else{
			next();
		}
	})
};