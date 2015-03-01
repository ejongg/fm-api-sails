/**
 * InventoryController
 *
 * @description :: Server-side logic for managing inventories
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	add : function(req, res){
		var item = req.body.item;

		var product = {
			bay_id : item.bay_id, 
			sku_id : item.sku_id, 
			exp_date : item.exp_date, 
			physical_count : item.cases, 
			logical_count : item.cases
		};

		Inventory.create(product).exec(function(err, cb){});
	},

	replenish : function(req, res){
		var id = req.param('id');
		var cases = req.body.cases;

		Inventory.findOneById(id)
			.exec(function(err, found){
				if(err)
					res.json({error : 'An error has occured'});

				if(found){
					var updatedPhysicalCount = found.physical_count + parseInt(cases, 10);
					var updatedLogicalCount = found.logical_count  + parseInt(cases, 10);

					Inventory.update({id : found.id}, {
						physical_count : updatedPhysicalCount,
						logical_count : updatedLogicalCount
					}).exec(function(err, updated){});
				}
			});
	}
};

