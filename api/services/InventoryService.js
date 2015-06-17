var async = require('async');
var moment = require('moment');
var Promise = require("bluebird");

module.exports = {
	
	deductCases : function (sku, cases, bottlespercase){
		return new Promise(function (resolve, reject){
			var caseCount = sku.physical_count;
			
			sku.bottles = Math.max(0, sku.bottles - (cases * bottlespercase));
			sku.physical_count = Math.max(0, sku.physical_count - cases);
			sku.logical_count = Math.max(0, sku.logical_count - cases);

			sku.save(function(err, saved){
				if(caseCount > cases){
					resolve(0);
				}else{
					resolve(cases - caseCount);
				}
			});
		});
	},

	deductFromInventory : function(sku, bottles, cases, bottlespercase){
		return new Promise(function (resolve){
			var remainingBottles = 0;

			if(bottles > 0){
				remainingBottles = bottlespercase - bottles;
			}

			IncompleteCasesService.add(sku.sku_id, sku.exp_date, sku.prod_date, remainingBottles)
				.then(function deductCases (){
					return InventoryService.deductCases(sku, cases, bottlespercase);
				})

				.then(function (remainingCases){
					resolve(remainingCases);
				})	
		});
	},

	deduct : function(skuId, bottles, cases, bottlespercase){
		return new Promise(function (resolve){

			Bays.findOne({sku_id : skuId, pile_status : "Moving pile"})
				.then(function (bay){
					return bay;
				})

				.then(function findSkusInInventory (bay){
					return Inventory.find({sku_id : skuId, bay_id : bay.id}).sort("exp_date ASC");	
				})

				.then(function (skus){
					var index = 0;

					async.whilst(
						function (){
							return cases > 0;
						},

						function (cb){
							if(skus[index].physical_count > 0){

								if(bottles > 0 && skus[index].physical_count > cases || bottles > 0 && skus.length -1 == index){
									var remainingBottles = 0;
									remainingBottles = bottlespercase - bottles;

									IncompleteCasesService.add(skus[index].sku_id, skus[index].exp_date, skus[index].prod_date, remainingBottles)
										.then(function (){
											return InventoryService.deductCases(skus[index], cases, bottlespercase);
										})

										.then(function (remainingCases){
											cases = remainingCases;
											cb();
										})
								}else{

									InventoryService.deductCases(skus[index], cases, bottlespercase)
										.then(function (remainingCases){
											cases = remainingCases;
											cb();
										})
								}

							}else{
								index++;
								cb();
							}
							
						},

						function(err){
							if(err) reject(err);

							resolve();
						}
					);
				})
		});
	},

	deductInSpecificBay : function(skuId, bottles, cases, bottlespercase, bayId){
		return new Promise(function (resolve){

			Inventory.find({sku_id : skuId, bay_id : bayId}).sort("exp_date ASC")
				.then(function (skus){
					return skus;
				})

				.then(function (skus){
					var index = 0;

					async.whilst(
						function (){
							return cases > 0;
						},

						function (cb){
							if(skus[index].physical_count > 0){

								if(bottles > 0 && skus[index].physical_count > cases || bottles > 0 && skus.length -1 == index){
									var remainingBottles = 0;
									remainingBottles = bottlespercase - bottles;

									IncompleteCasesService.add(skus[index].sku_id, skus[index].exp_date, skus[index].prod_date, remainingBottles)
										.then(function (){
											return InventoryService.deductCases(skus[index], cases, bottlespercase);
										})

										.then(function (remainingCases){
											cases = remainingCases;
											cb();
										})
								}else{

									InventoryService.deductCases(skus[index], cases, bottlespercase)
										.then(function (remainingCases){
											cases = remainingCases;
											cb();
										})
								}

							}else{
								index++;
								cb();
							}
							
						},

						function(err){
							if(err) reject(err);

							resolve();
						}
					);
				})
		});
	},

	deductSpecificProduct : function(skuId, bottles, cases, bottlespercase, bayId, prodDate){
		return new Promise(function (resolve, reject){

			Inventory.find({sku_id : skuId, bay_id : bayId, prod_date : prodDate})
				.then(function (skus){
					return skus;
				})

				.then(function (skus){
					var index = 0;

					async.whilst(
						function (){
							return cases > 0;
						},

						function (cb){

							if(skus[index].physical_count > 0){
								InventoryService.deductFromInventory(skus[index], bottles, cases, bottlespercase)
									.then(function (remainingCases){
										cases = remainingCases;
										cb();
									})
							}else{
								index++;
								cb();
							}
							
						},

						function(err){
							if(err) reject(err);

							resolve();
						}
					);
				})
		});
	},

	put : function(sku_id, cases, bottlespercase, bay_id, prod_date, lifespan){
		return new Promise(function (resolve ,reject){

			var exp_date = moment(prod_date).add(lifespan, 'M').format('YYYY-MM-DD');
			
			Inventory.findOne({sku_id : sku_id, bay_id : bay_id, exp_date : exp_date, prod_date : prod_date,})
				.then(function findInInventory(found_sku){
					if(found_sku){
						found_sku.bottles = found_sku.bottles + (bottlespercase * cases);
						found_sku.physical_count = found_sku.physical_count + cases;
						found_sku.logical_count = found_sku.logical_count + cases;

						found_sku.save(function(err, saved){
							resolve();
						});
					}else{
						var item = {
							bay_id : bay_id,
							sku_id : sku_id,
							exp_date : exp_date,
							prod_date : prod_date,
							bottles : cases * bottlespercase,
							physical_count : cases,
							logical_count : cases
						};

						Inventory.create(item).exec(function(err, created){
							resolve();
						});
					}		
				});
		});
	},

	countInventory : function (){
		return new Promise(function (resolve, reject){
			var totalCount = 0;

			Inventory.find()
				.then(function (items){
					return items;					
				})

				.each(function (item){
					totalCount = totalCount + item.physical_count;
				})

				.then( function (){
					resolve(totalCount);		
				});
		});		
	},

	updateExpirationDate : function (id, newLifeSpan, oldLifeSpan){
		return new Promise(function (resolve, reject){

			Inventory.find({sku_id : id})
				.then(function (items){
					return items;
				})

				.each(function (item){
					return new Promise(function (resolve, reject){
						var productionDate = moment(item.exp_date, "YYYY-MM-DD").subtract(oldLifeSpan, 'M').format('YYYY-MM-DD');
						var newExpirationDate = moment(productionDate, "YYYY-MM-DD").add(newLifeSpan, 'M').format('YYYY-MM-DD');

						item.exp_date = newExpirationDate;
			
						item.save(function (err, saved){
							resolve();
						});
					});
				})

				.then(function (){
					resolve();
				})
		});
	}
};