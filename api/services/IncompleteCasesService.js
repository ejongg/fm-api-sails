
var Promise = require("bluebird");

module.exports = {
	add : function(sku, expDate, prodDate, remainingBottles){
		return new Promise(function (resolve, reject){
			if(remainingBottles > 0){
				Incomplete_cases.findOne({sku_id : sku, exp_date : expDate, prod_date : prodDate})
					.then(function(found){

						if(found){
							found.bottles = found.bottles + remainingBottles;
							found.save(function(err, saved){
								resolve();
							});
							
						}else{
							Incomplete_cases.create({sku_id : sku, exp_date : expDate, prod_date : prodDate, bottles : remainingBottles})
								.exec(function(err, incompletes){
									resolve();
								});
						}
					});	
			}else{
				resolve();
			}
		});
	},

	deduct : function(sku, bottles){
		return new Promise(function (resolve){	

			Incomplete_cases.findOne({sku_id : sku.sku_id, prod_date : sku.prod_date})
				.then(function (foundItem){
					var itemBottles = foundItem.bottles;
					foundItem.bottles = Math.max(0, foundItem.bottles - bottles);

					foundItem.save(function (err, saved){
						if(itemBottles > bottles){
							resolve(0);
						}else{
							resolve(bottles - itemBottles);
						}
					});
				})
		});
	}
};