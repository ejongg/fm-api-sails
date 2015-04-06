/**
 * TrucksController
 *
 * @description :: Server-side logic for managing trucks
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 var moment = require('moment');

module.exports = {
	add : function(req, res){
		var truck = {
		    driver : req.body.driver,
			dispatcher : req.body.dispatcher,
			agent : req.body.agent,
			helper : req.body.helper,
			route : req.body.route,
			carry_weight : req.body.carry_weight
		}

		Trucks.findOne(truck)
			.then(function(found_truck){
				if(found_truck){
					return res.send("You are entering a duplicate entry");
				}else{
					Trucks.create(truck).exec(function(err, created_truck){
						sails.sockets.blast('trucks', {verb : 'created', data : truck});
						return res.send(201);
					});
				}
			})

			.catch(function(err){
				console.log(err);
			});
	}
};

