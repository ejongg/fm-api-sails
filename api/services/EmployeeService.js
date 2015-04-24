var Promise = require("bluebird");

module.exports = {
	assign : function(employees, truckId){
		return new Promise(function (resolve, reject){
			async.each(employees, function (employeeId, cb){
				Employees.findOne({id : employeeId})
					.then(function (emp){
						emp.truck_id = truckId;
						emp.save(function (err, saved){
							cb();
						})
					})
			}, 

			function(err){
				resolve();
			});
		});
	}
}