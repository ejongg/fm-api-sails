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

				async.each(inventory_items, function (item, cb){
					if(item.physical_count > 0 ){
						Sku.findOne({id : item.sku_id.id}).populate('prod_id')
							.then(function (sku){
								if(available.length == 0){							
									available.push(sku);
									cb();
								}else{
									for(var i = 0 ; i < available.length; i++){
										if(available[i].id != sku.id){
											available.push(sku);																				
										}								
									}
									cb();	
								}
							});												
					}else{
						cb();
					}

				}, function (err){
					if(err)
						console.log(err);

					return res.send(available);
				});				
			},

			function(err){
				console.log(err);	
			});
	}
};

