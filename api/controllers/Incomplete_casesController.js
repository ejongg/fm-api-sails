/**
 * Incomplete_casesController
 *
 * @description :: Server-side logic for managing incomplete_cases
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Promise = require("bluebird");
var moment = require("moment");

module.exports = {
	assembleCase : function (req, res){
		var product = req.body.products;
		var totalBottles = product.cases * product.bottlespercase;
		var productionDate = null;

		Incomplete_cases.find({sku_id : product.sku_id, bottles : {'!' : 0}}).sort('exp_date ASC')
			.then(function (foundItems){
				productionDate = foundItems[0].prod_date;
				return foundItems;
			})

			.then(function (items){
				var index = 0;

				async.whilst(function(){
					return totalBottles > 0;
				},

				function (cb){
					if(items[index].bottles > 0){
						IncompleteCasesService.deduct(items[index], totalBottles)
							.then(function (remainingBottles){
								totalBottles = remainingBottles;
								index++;
								cb();
							})
					}else{
						index++;
						cb();
					}
				},

				function (err){
					if(err) return res.send(err, 400);

					InventoryService.put(product.sku_id, product.cases, product.bottlespercase, product.bay_id, productionDate, product.lifespan)
						.then(function (){
							sails.sockets.blast('incomplete_cases', {verb : "updated"});
							sails.sockets.blast('inventory', {verb : "updated"});
							return res.send('Case assembled', 201);
						})
				})
			})
	},

	list : function (req, res){
		var list = [];

		Incomplete_cases.find({bottles : {'>' : 0}}).populateAll()
			.then(function (results){
				return results;
			})

			.each(function (item){
				return new Promise(function (resolve){
					var index = _.findIndex(list, {sku : item.sku_id.id});

					if(index == -1){
						item.sku = item.sku_id.id;
						SkuService.getProductName(item.sku_id.id).then(function (brandName){
							item.brand_name = brandName;
						})

						.then(function (){
							return SkuService.getSkuCompleteName(item.sku_id.id);
						})

						.then(function (completeSkuName){
							item.sku_id.sku_name = completeSkuName;
							list.push(item);
							resolve();
						})

					}else{
						list[index].bottles = list[index].bottles + item.bottles;
						resolve();
					}
					
				});
			})

			.then(function (){
				return res.send(list);
			})
	}
};

