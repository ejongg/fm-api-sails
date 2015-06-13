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
		var truckId = req.body.id;
		var dispatcherId = req.body.dispatcher.id;
		var driverId = req.body.driver.id;
		var agentId = req.body.agent.id;
		var helperId = req.body.helper.id;
		var routeId = req.body.route.id;
		var toReplace = [];
		var toBeReplaced = [];
		var replacedRoute = null;
		
		Trucks.findOne({id : truckId}).then(function (foundTruck){
			var newEmployees = [dispatcherId, driverId, agentId, helperId];
			var prevEmployees = [foundTruck.dispatcher, foundTruck.driver, foundTruck.agent, foundTruck.helper];
			
			var updateQuery = {
				route : routeId
			};

			if(routeId != foundTruck.route){
				replacedRoute = foundTruck.route;
			}

			for(var i = 0; i < newEmployees.length; i++){
				if(newEmployees[i] != prevEmployees[i]){
					switch(i){
						case 0: 
							updateQuery.dispatcher = newEmployees[i];
							toReplace.push(newEmployees[i]);
							toBeReplaced.push(prevEmployees[i]);
							break;
						case 1:
							updateQuery.driver = newEmployees[i];
							toReplace.push(newEmployees[i]);
							toBeReplaced.push(prevEmployees[i]);
							break;
						case 2:
							updateQuery.agent = newEmployees[i];
							toReplace.push(newEmployees[i]);
							toBeReplaced.push(prevEmployees[i]);
							break;
						case 3:
							updateQuery.helper = newEmployees[i];
							toReplace.push(newEmployees[i]);
							toBeReplaced.push(prevEmployees[i]);
							break;
					}
				}
			}

			return Trucks.update({id : truckId}, updateQuery);
		})

		.then(function (){
			if(toBeReplaced.length > 0){
				return new Promise(function (resolve){
					new Promise(function (resolve){
						resolve(toBeReplaced);
					})

					.each(function (employeeId){
						return Employees.update({id : employeeId}, {truck_id : null});
					})

					.then(function (){
						resolve();
					})
				});
			}
		})

		.then(function (){
			if(toReplace.length > 0){
				return new Promise(function (resolve){

					new Promise(function (resolve){
						resolve(toReplace);
					})

					.each(function (employeeId){
						return Employees.update({id : employeeId}, {truck_id : truckId});
					})

					.then(function (){
						resolve();
					})
				});
			}
		})

		.then(function (){
			var replacedEmployees = [];
			var newEmployees = [];
			var prevRoute = null;
			var newRoute = null;

			Trucks.findOne({id : truckId}).populateAll().then(function (foundTruck){
				Routes.findOne({id : routeId}).populateAll().then(function (foundRoutes){
					foundTruck.route = foundRoutes;
				})

				.then(function (){
					return toBeReplaced;
				})

				.each(function (employeeId){
					return new Promise(function (resolve){
						Employees.findOne({id : employeeId}).populateAll()
							.then(function (foundEmployee){
								replacedEmployees.push(foundEmployee);
								resolve();
							})
					});
				})

				.then(function (){
					return toReplace;
				})

				.each(function (employeeId){
					return new Promise(function (resolve){
						Employees.findOne({id : employeeId}).populateAll()
							.then(function (foundEmployee){
								newEmployees.push(foundEmployee);
								resolve();
							})
					});
				})

				.then(function (){
					if(replacedRoute != null){
						return new Promise(function (resolve){
							Routes.findOne({id : replacedRoute}).populateAll()
								.then(function (foundRoute){
									prevRoute = foundRoute;
									resolve();
								})
						});
					}
				})

				.then(function (){
					if(replacedRoute != null){
						return new Promise(function (resolve){
							Routes.findOne({id : routeId}).populateAll()
								.then(function (foundRoute){
									newRoute = foundRoute;
									resolve();
								})
						});
					}
				})

				.then(function (){
					var data = {};

					if(prevRoute && newRoute){
						data.prev_route = prevRoute;
						data.new_route = newRoute;
					}

					if(replacedEmployees.length > 0 && newEmployees.length > 0){
						data.prev_employees = replacedEmployees;
						data.new_employees = newEmployees;
					}

					sails.sockets.blast('trucks', {verb : "replaced", data : data});
					sails.sockets.blast('trucks', {verb : "updated", data : foundTruck});
					return res.send("Truck updated successfully", 200);
				})
			});

		})
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

