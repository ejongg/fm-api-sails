module.exports = function(req, res, next){
	var findEmployee = {
		    emp_fname : req.body.emp_fname,
			emp_lname : req.body.emp_lname,
			position : req.body.position,
			office : req.body.office,	
		};

	Employees.findOne(findEmployee)
		.then(function (foundEmployee){
			if(foundEmployee){
				return res.send("Employee already exists", 400);
			}else{
				next();
			}
		})
};