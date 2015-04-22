
var Promise = require("bluebird");

module.exports = {
	add : function(sku, expDate, remainingBottles){
		return new Promise(function (resolve, reject){
			if(remainingBottles > 0){
				Incomplete_cases.findOne({sku_id : sku, exp_date : expDate})
					.then(function(found){

						if(found){
							found.bottles = found.bottles + remainingBottles;
							found.save(function(err, saved){
								resolve();
							});
							
						}else{
							Incomplete_cases.create({sku_id : sku, exp_date : expDate, bottles : remainingBottles})
								.exec(function(err, incompletes){
									resolve();
								});
						}
					});	
			}else{
				resolve();
			}
		});
	}
};