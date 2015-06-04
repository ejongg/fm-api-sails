/**
 * InventoryController
 *
 * @description :: Server-side logic for managing inventories
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');
var Promise = require("bluebird");

module.exports = {
	getInventory : function(req, res){
		var inventory = [];

		Inventory.find({physical_count : {'>' : 0}}).populate('bay_id')
			.then(function searchInventory(inventoryItems){
				return inventoryItems;
			})

			.each(function insertAgeToEachObject(item){
				SkuService.getLifespan(item.sku_id)
					.then(function (lifespan){
						var prodDate = moment(item.exp_date).subtract(lifespan, 'M').format('YYYY-MM-DD');
						item.age = moment().from(prodDate, true);
					})
			})

			.each(function (item){				
				return new Promise(function (resolve, reject){
					SkuService.addDetails(item)
						.then(function (result){
							inventory.push(result);
							resolve();
						})
				})		
			})

			.then(function (){
				return res.send(inventory);
			})
	}
};

