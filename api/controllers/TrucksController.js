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

		Trucks.create(truck)
			.then(function (createdTruck){
				return new Promise(function (resolve, reject){
					EmployeeService.assign([truck.driver, truck.dispatcher, truck.agent, truck.helper], createdTruck.id)
						.then(function (){
							resolve(createdTruck);
						})
				}); 
			})

			.then(function (createdTruck){
				Trucks.findOne({id : createdTruck.id}).populateAll().then(function (foundTruck){

					Routes.findOne({id : foundTruck.route}).populateAll().then(function (foundRoute){
						foundTruck.route = foundRoute;
					})

					.then(function (){
						sails.sockets.blast('trucks', {verb : 'created', data : foundTruck});
						return res.send("Truck successfully created", 200);
					})

				})
			})

			.catch(function(err){
				return res.send(err);
			});
	},

	edit : function(req ,res){
		var truck;

		Trucks.update({id : truck.id}, truck)
			.then(function (updatedTruck){
				
				Trucks.findOne({id : updatedTruck.id}).populateAll()
					.then(function (foundTruck){
						sails.sockets.blast("trucks", {verb : "updated", data : foundTruck});
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
					sails.sockets.blast("employees", {verb : "updated", data : saved});
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
				return new Promise(function (resolve){
					Routes.findOne({id : truck.route}).populateAll()
						.then(function (route){
							truck.route = route;
							resolve();
						})
				});
			})

			.then(function (trucks){
				return res.send(trucks);
			});
	},

	remove : function (req, res){
		var truckId = req.query.id;

		Trucks.findOne({id : truckId}).populateAll().then(function (foundTruck){

			Routes.findOne({id : foundTruck.route}).populateAll()
				.then(function (foundRoute){
					foundTruck.route = foundRoute;
				})

				.then(function (){
					return Trucks.destroy({id : truckId});
				})

				.then(function (){
					sails.sockets.blast('trucks', {verb : 'destroyed', data : foundTruck});
					return res.send("Truck successfully deleted", 200);
				})
		})
	}
};

