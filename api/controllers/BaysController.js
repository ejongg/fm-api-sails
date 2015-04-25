/**
 * BayController
 *
 * @description :: Server-side logic for managing bays
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	add : function(req, res){
		
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
					return res.send(201);
				});
			})

			.catch(function(err){
				return res.send(err);
			});
	},

	list : function (req, res){
		var baysList = []; 

		Bays.find()
			.then(function (bays){
				return bays;
			})

			.each(function (bay){
				return BaysService.countBayItems(bay.id)
				 .then(function (count){
				 	bay.total_products = count;
				 	baysList.push(bay);
				 })
			})

			.then(function (){
				res.send(baysList);
			})
	},

	listNotEmpty : function(req, res){
		var baysList = [];
		var company = req.query.company;

		console.log(company);

		Bays.find({bay_label : company})
			.then(function (bays){
				return bays;
			})

			.each(function (bay){
				return BaysService.countBayItems(bay.id)
				 .then(function (count){
				 	if(count > 0){
				 		bay.total_products = count;
				 		baysList.push(bay);
				 	}
				 })
			})

			.then(function (){
				res.send(baysList);
			})
	}
};

