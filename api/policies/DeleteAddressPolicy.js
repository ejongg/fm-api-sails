var Promise = require('bluebird');

module.exports = function(req, res, next){
	var addressId = req.param('id');

	Address.findOne({id : addressId}).then(function (foundAddress){

		if(foundAddress.route_id == null){
			next();
		}else{
			Routes.findOne({id : foundAddress.route_id}).then(function (foundRoute){
				return res.send({message :'Can\'t delete. Address is assigned to route ' + foundRoute.route_name, data : {route : foundAddress.route_id}}, 400);
			})
		}

	});
};