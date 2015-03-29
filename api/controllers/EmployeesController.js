/**
 * EmployeesController
 *
 * @description :: Server-side logic for managing employees
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

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
					Employees.create(employee).exec(function(err, created_employee){});
				}
			})
	}
};

