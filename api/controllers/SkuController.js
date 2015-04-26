/**
 * SkuController
 *
 * @description :: Server-side logic for managing sku
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Promise = require("bluebird");

module.exports = {
	available : function(req, res){
		var available = [];

		Inventory.find().populate('sku_id')
			.then(function getAvailableSkus(inventoryItems){
				return inventoryItems; 				
			})

			.each(function (item){
				return new Promise(function (resolve, reject){
					if(item.physical_count > 0 && _.findIndex(available, {id : item.sku_id.id}) == -1){
						Sku.findOne({id : item.sku_id.id}).populate('prod_id')
							.then(function (sku){
								available.push(sku);
								resolve();
							})
					}else{
						resolve();
					}
				})
			})

			.then(function (){
				return res.send(available);
			})
	}
};

