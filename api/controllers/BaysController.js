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
	},

	changemovingpile : function changeMovingPile(req, res){
		var currentMovingPile = req.body.current_bay;
		var newMovingPile = req.body.next_bay;

		async.parallel([
			function updateCurrentMovingPile(){
				Bays.findOne({bay_id : currentMovingPile})
					.then(function(current){
						current.pile_status = "Full goods";
						current.save(function(err, saved){});
					},
					function(err){
						console.log(err);
					});
			},

			function updateNewMovingPile(){
				Bays.findOne({bay_id : newMovingPile})
					.then(function(next){
						next.pile_status = "Moving pile";
						next.save(function(err, saved){});
					},

					function(err){
						console.log(err);
					});
			}
		], function emitEvent(err, cb){
			sails.sockets.blast('bays', {verb : 'change_pile'});
		});
	}
};

