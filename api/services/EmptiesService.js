var Promise = require('bluebird');

module.exports = {
	put : function(sku_id, bottlespercase, bottles, cases){
		return new Promise(function (resolve){

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

	deduct : function(skuId, cases, bottles, bottlespercase){
		return new Promise(function (resolve){

			Empties.findOne({sku_id : skuId})
				.then(function (foundSku){
					foundSku.cases = foundSku.cases - cases;
					foundSku.bottles = foundSku.bottles - (bottlespercase * cases);

					if(bottles > 0){
						return EmptiesService.deductBottles(skuId, bottles);
					}

					foundSku.save(function (err, saved){
						resolve();
					});
				})
		});
	},

	deductBottles : function(skuId, bottles){
		return new Promise(function (resolve){
			Empties.findOne({sku_id : skuId})
				.then(function (foundEmpty){
					foundEmpty.bottles = foundEmpty.bottles - bottles;

					foundEmpty.save(function (err, saved){
						resolve();
					});
				})
		});
	},

	deductEmptyBottles : function (skuId, emptyBottles, bottlespercase){
		return new Promise(function (resolve){
			Empties.findOne({sku_id : skuId})
				.then(function (emptyRecord){

					if(emptyBottles > bottlespercase){
						EmptiesService.countCases(emptyBottles, bottlespercase)
							.then(function (result){
								emptyRecord.bottles = emptyRecord.bottles - result.bottles;
								emptyRecord.cases = emptyRecord.cases - result.cases;

								emptyRecord.save(function (err, saved){
									resolve();
								});
							})

					}else{
						emptyRecord.bottles = emptyRecord.bottles - emptyBottles;
						emptyRecord.cases = emptyRecord.cases - 1;
						emptyRecord.save(function (err, saved){
							resolve();
						});
					}
				})
		});
	},

	countEmptyBottles : function (skuId){
		return new Promise(function (resolve, reject){
			var totalBottles = 0;

			Empties.find({sku_id : skuId})
				.then(function (emptyItems){
					return emptyItems;
				})

				.each(function (emptyItem){
					totalBottles = totalBottles + emptyItem.bottles;
				})

				.then(function (){
					resolve(totalBottles);
				})
		});
	},

	countBottlesAndCases : function (skuId){
		return new Promise(function (resolve){
			Empties.findOne({sku_id : skuId})
				.then(function (foundEmpty){
					resolve({cases : foundEmpty.cases, bottles : foundEmpty.bottles});
				})
		});
	},

	countCases : function (bottles, bottlespercase){
		return new Promise(function (resolve, reject){
			var cases = 0;

			do{
				cases = cases + 1;

			}while((bottles % bottlespercase) > bottlespercase);

			resolve({cases : cases, bottles : bottles});
		});
	}
};