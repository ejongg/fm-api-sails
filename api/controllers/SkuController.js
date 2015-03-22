/**
 * SkuController
 *
 * @description :: Server-side logic for managing sku
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	available : function(req, res){
		var available = [];

		Inventory.find().populate('sku_id')
			.then(function getAvailableSkus(inventory_items){

				(inventory_items).forEach(function(item){
					if(item.physical_count > 0){
						available.push(item.sku_id);
					}
				});

				return res.send(available);
			},

			function(err){
				console.log(err);	
			});
	}
};

