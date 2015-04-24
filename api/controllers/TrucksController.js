/**
 * TrucksController
 *
 * @description :: Server-side logic for managing trucks
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var moment = require('moment');
var Promise = require("bluebird");

module.exports = {
	add : function(req, res){

		var truck = {
		    driver : req.body.driver.id,
			dispatcher : req.body.dispatcher.id,
			agent : req.body.agent.id,
			helper : req.body.helper.id,
			route : req.body.route,
			carry_weight : req.body.carry_weight
		}

		Trucks.findOne(truck)
			.then(function(foundTruck){
				if(foundTruck){
					return res.send("You are entering a duplicate entry");
				}
			})

			.then(function (){
				return new Promise(function (resolve, reject){
					Trucks.create(truck)
						.then(function(createdTruck){
							resolve(createdTruck);
						});
					});				
			})

			.then(function (createdTruck){
				return new Promise(function (resolve, reject){
					EmployeeService.assign([truck.driver, truck.dispatcher, truck.agent, truck.helper], createdTruck.id)
						.then(function (){

							resolve(createdTruck);
							
						})
				}); 
			})

			.then(function (createdTruck){
				Trucks.findOne({id : createdTruck.id}).populateAll()
					.then(function (newTruck){
						console.log(newTruck);
						sails.sockets.blast('trucks', {verb : 'created', data : newTruck});
						return res.send(201);
					})
			})

			.catch(function(err){
				return res.send(err);
			});
	}
};

