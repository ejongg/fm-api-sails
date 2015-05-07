var Promise = require('bluebird');

module.exports = function(req, res, next){
	var orders = req.body.orders;
	var notAvailable = [];

	function getOrders(){
		return new Promise(function (resolve, reject){
			resolve(orders);
		});
	};

	return getOrders()

		.each(function (order){
			return new Promise(function (resolve, reject){
				SkuService.getCompanyName(order.sku_id)
					.then(function (company){
						if(company == 'SMB'){

							BaysService.findMovingPile(company, function(err, bay_result){
								if(typeof bay_result == 'number'){
									Inventory.find({sku_id : order.sku_id, bay_id : bay_result})
										.then(function (found_sku){

											if(found_sku){
												var totalCaseCount = 0;

												_(found_sku).forEach(function (sku){
													totalCaseCount = totalCaseCount + sku.physical_count;
												});

												if(order.bottles > 0){
													order.cases  = order.cases + 1;
												}

												if(order.cases > totalCaseCount){
													notAvailable.push(order.sku);
													resolve();
												}else{
													console.log(order);
													resolve();
												}

											}else{
												return res.json({code : 0, message : order.sku_name + ' not found in current moving pile'});							
											}

										});	

								}else{
									return res.send({code : 0, message : bay_result});
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
				return res.json({code : 0, message : 'Insufficient stocks in current moving pile', data : notAvailable});
			}else{
				next();
			}
		})
};