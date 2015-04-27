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
		var product = req.body.product;
		
		var productionDate = moment(product.exp_date).substract(lifespan, 'months');

		InventoryService.put(product.sku_id, product.cases, product.bottlespercase, product.bay, productionDate, product.lifespan)	
			.then(function (){
				return new Promise(function (resolve, reject){
					Incomplete_cases.findOne({sku_id : product.sku_id, exp_date : product.exp_date})
						.then(function (item){
							resolve(item);
						})
				});
			})

			.then(function (item){
				item.bottles = item.bottles - (product.cases * bottlespercase);

				item.save(function (err, saved){
					sails.sockets.blast("incomplete_cases", {verb : "created", data : saved});
					return res.send(200);
				});
			})
	},

	list : function (req, res){
		var list = [];

		Incomplete_cases.find({bottles : {'>' : 0}}).populateAll()
			.then(function (results){
				return results;
			})

			.each(function (item){
				return new Promise(function (resolve, reject){
					SkuService.getProductName(item.sku_id.id)
						.then(function (brandName){
							item.brand_name = brandName;
							list.push(item);
							resolve();
						})
				});
			})

			.then(function (){
				return res.send(list);
			})
	}
};

