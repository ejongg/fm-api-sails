/**
 * BayController
 *
 * @description :: Server-side logic for managing bays
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var async = require('async');

module.exports = {
	bayitems : function getBayProducts(req, res){
		
		Bays.find()
			.then(function getBays(bays){
				return bays;
			},

			function(err){
				console.log(err);
			})

			.then(function CountBayProducts(bays){
				var baysWithProductCount = [];

				async.each(bays, function fillArray(bay, cb){
					BaysService.countBayItems(bay.id, function(err, count){
						baysWithProductCount.push({bay_id : bay.id, total_products : count});
						cb();
					});
				},
				function (err){
					if(err)
						console.log(err);

					return res.send(baysWithProductCount);
				});

			},

			function(err){
				console.log(err);
			});
	}
};

