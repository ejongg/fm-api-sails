var async = require('async');

module.exports = {
	nextBay : function(company){
		Bays.findOne({pile_status : "Moving pile", bay_label : company})
			.then(function(bay){
				bay.pile_status = "Full goods";
				bay.save(function(err, saved){});

				return bay.id;
			},

			function(err){
				console.log(err);
			})

			.then(function(prev_bay){
				Bays.findOne({bay_id : prev_bay + 1, bay_label : company})
					.exec(function(err, next_bay){
						if(err)
							console.log(err);

						if(next_bay){
							next_bay.pile_status = "Moving pile";
							next_bay.save(function(err, saved){});
						}else{
							return res.json({code : 0, message : "Last bay already selected"});
						}
					});
			});
	},

	countProduct : function(sku_id, bay_id, callback){
		
		Inventory.find({sku_id : sku_id, bay_id : bay_id})
			.then(function(inventory_items){
				var totalCount = 0;
				
				(inventory_items).forEach(function(item){
					totalCount = totalCount + item.physical_count;
				});

				callback(null, totalCount);
			},

			function(err){
				callback(err);
			});
		
	},

	countBayItems : function(bay_id, callback){

		Inventory.find({bay_id : bay_id})
			.then(function(products){
				return products;	
			},

			function(err){
				console.log(err);
				callback(err);
			})

			.then(function(products){
				var count = 0;

				(products).forEach(function(product){	
					count = count + product.physical_count;
				});

				callback(null, count);
			},

			function(err){
				console.log(err);
				callback(err);
			});
	},

	findMovingPile : function(company, callback){
		Bays.findOne({bay_label : company, pile_status : "Moving pile"})
			.then(function(bay){
				callback(null, bay.id);
			},

			function(err){
				callback(err);
			});
	}
};