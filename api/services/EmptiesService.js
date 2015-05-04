var Promise = require('bluebird');

module.exports = {
	put : function(sku_id, bottlespercase, bottles, cases){
		return new Promise(function (resolve, reject){

			Empties.findOne({sku_id : sku_id})
				.then(function (foundSku){

					if(foundSku){
						foundSku.bottles = foundSku.bottles + bottles + (bottlespercase * cases);
						foundSku.cases = foundSku.cases + cases;

						foundSku.save(function (err, saved){
							resolve();
						});

					}else{

						var empty = {
							sku_id : sku_id,
							bottles : bottles + (bottlespercase * cases),
							cases : cases
						};

						return Empties.create(empty);
					}
				})
		});
	},

	deduct : function(sku_id, bottlespercase, cases){
		return new Promise(function (resolve, reject){

			Empties.findOne({sku_id : sku_id})
				.then(function (foundSku){
					foundSku.cases = foundSku.cases - cases;
					foundSku.bottles = foundSku.bottles - (bottlespercase * cases);

					foundSku.save(function (err, saved){
						resolve();
					});
				})
		});
	}
};