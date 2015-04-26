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
						sails.sockets.blast('trucks', {verb : 'created', data : newTruck});
						return res.send(201);
					})
			})

			.catch(function(err){
				return res.send(err);
			});
	},

	edit : function(req ,res){
		var truckId = req.body.truck;
		var prevEmp = req.body.prev_emp;
		var newEmp = req.body.new_emp;
		var position = req.body.position;

		Trucks.update({id : truckId}, {position : newEmp})
			.then(function (updatedTruck){
				Trucks.findOne({id : updatedTruck.id}).populateAll()
					.then(function (foundTruck){
						sails.sockets.blast("trucks", {verb : "created", data : foundTruck});
					})
			})

			.then(function (){
				return new Promise(function (resolve, reject){
					Employees.findOne({id : prevEmp})
						.then(function (foundEmp){
							resolve(foundEmp);	
						})
				})				
			})

			.then(function (foundEmp){
				foundEmp.truck_id = null;

				foundEmp.save(function (err, saved){
					sails.sockets.blast("employees", {verb : "created", data : saved});
					return res.send(200);		
				});
			})

			.catch(function(err){
				return res.send(err);
			});
	},

	list : function (req, res){
		Trucks.find().populateAll()
			.then(function (trucks){
				return trucks;
			})

			.each(function (truck){
				return new Promise(function (resolve, reject){
					Routes.findOne({id : truck.route})
						.then(function (route){
							truck.route = route;
							resolve();
						})
				});
			})

			.then(function (trucks){
				return res.send(trucks);
			});
	}
};

