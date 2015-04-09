/**
 * InventoryController
 *
 * @description :: Server-side logic for managing inventories
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');

module.exports = {
	getInventory : function(req, res){
		var inventory = [];

		Inventory.find().populate('bay_id')
			.then(function(inventoryItems){
				return inventoryItems;
			})

			.then(function(inventoryItems){				
				async.each(inventoryItems, function(item, cb){

					Sku.findOne({id : item.sku_id}).populate('prod_id')
						.then(function(foundSku){
							item.company = foundSku.prod_id.company;
							item.brand_name = foundSku.prod_id.brand_name;
							item.sku_name = foundSku.sku_name;
							item.size = foundSku.size;

							inventory.push(item);
							cb();
						});
				},

				function(err){
					if(err)
						return res.send(err);

					return res.send(inventory);
				});
			});
	}
};

