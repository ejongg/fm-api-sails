/**
 * EmployeesController
 *
 * @description :: Server-side logic for managing employees
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 var Promise = require('bluebird');

module.exports = {
	add : function(req, res){
		var employee = {
		    emp_fname : req.body.emp_fname,
			emp_lname : req.body.emp_lname,
			position : req.body.position,
			office : req.body.office
		}

		Employees.findOne(employee)
			.then(function(found_employee){
				if(found_employee){
					return res.send("You are entering a duplicate entry");
				}else{
					Employees.create(employee).exec(function(err, createdEmployee){
						sails.sockets.blast("employees", {verb : "created", data : createdEmployee});
						return res.send(201);
					});
				}
			})
	},

	list : function(req, res){
		var position = req.query.position;

		var query;

		if(position){
			query = {
				truck_id : null, 
				position : position
			}
		}else{
			query = {
				truck_id : null
			}
		}

		Employees.find(query)
			.then(function (employees){
				return res.send(employees);
			})	
	},

	listForEdit : function(req, res){
		var truckId = req.query.truck;
		var position = req.query.position;

		var list = [];

		Employees.find({truck_id : null, position : position})
			.then(function (unassigned){
				list = unassigned;
			})

			.then(function (){
				return new Promise(function (resolve, reject){
					Employees.findOne({truck_id : truckId, position : position})
						.then(function (current){
							list.unshift(current);
							resolve();
						})
				});
			})

			.then(function (){
				return res.send(list);
			})
	}
};

