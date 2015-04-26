
var Promise = require("bluebird");

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

	countBayItems : function(bay_id){
		return new Promise(function (resolve, reject){
			var count = 0;

			Inventory.find({bay_id : bay_id})
				.then(function(products){
					return products;	
				})

				.each(function(product){
					count = count + product.physical_count;	
				})

				.then(function (){
					resolve(count);
				})
		});
	},

	findMovingPile : function(company, callback){
		Bays.findOne({bay_label : company, pile_status : "Moving pile"})
			.then(function(bay){

				if(bay){
					callback(null, bay.id);
				}else{
					callback(null, "There is no moving pile for company " + company + ". Please go to bays.");
				}
			},

			function(err){
				callback(err);
			});
	}
};