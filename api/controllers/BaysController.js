/**
 * BayController
 *
 * @description :: Server-side logic for managing bays
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var async = require('async');

module.exports = {
	bayitems : function getBayProducts(req, res){
		var bays_with_products = [];

		async.series([
			function(cb){
				Bays.find().exec(function(err, bays){
					(bays).forEach(function(bay){

						Inventory.find({bay_id : bay.id})
							.exec(function(err, products){
								var total_count = 0;

								async.each(products, function(product, cb){
									total_count = total_count + product.physical_count;
									cb();
								}, function(err){
									if(err) 
										console.log(err);

									bays_with_products.push({bay_id : bay.id, total_products : total_count});
									cb();
								});	
							});	
					});
				});

			},

			function(cb){
				return res.send(bays_with_products);
				cb();
			}
		]);
	}
};

