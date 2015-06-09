var Promise = require('bluebird');

module.exports = function (req, res, next){
	var routeName = req.body.route_name;
	var company = req.body.company;

	Routes.findOne({route_name : routeName, company : company})
		.then(function (foundRoute){

			if(foundRoute){
				var data = {
					route_name : routeName,
					company : company
				};

				return res.send({message : "Route " + routeName + " already exist for " + company, data : data}, 400)
			}else{
				next();
			}
		})
};