var Promise = require('bluebird');

module.exports = function (req, res, next){
	var routeId = req.body.route;

	Trucks.findOne({route : routeId})
		.then(function(foundTruck){

			if(foundTruck){
				return res.send({message : "Route already assigned"}, 400);
			}else{
				next();
			}
		})
};