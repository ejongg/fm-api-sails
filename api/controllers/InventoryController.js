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

		Inventory.find().populate('bay_id')
			.then(function searchInventory(inventoryItems){
				return inventoryItems;
			})

			.each(function insertAgeToEachObject(item){
				item.age = moment().from(item.createdAt, true);
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

