/**
 * BayController
 *
 * @description :: Server-side logic for managing bays
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	add : function createBay (req, res){
		
		var bay = {
			bay_name : req.body.bay_name,
			bay_label : req.body.bay_label,
			bay_limit : req.body.bay_limit
		}

		Bays.create(bay)
			.then(function(created_bay){
				return created_bay;
			})

			.then(function (bay){
				BaysService.countBayItems(bay.id, function(err, count){
					sails.sockets.blast('bays', {verb : 'created', data : bay, bayitem : {bay_id : bay.id, total_products : count}});
				});
			})

			.catch(function(err){
				return res.send(err);
			});
	},

	list : function (req, res){
		var baysWithProductCount = [];

		Bays.find()
			.then(function (bays){
				return bays;
			})

			.each(function (bay){
				return BaysService.countBayItems(bay.id)
				 .then(function (count){
				 	bay.total_products = count;
				 	baysWithProductCount.push(bay);
				 })
			})

			.then(function (){
				res.send(baysWithProductCount);
			})
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

