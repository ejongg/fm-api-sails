var Promise = require('bluebird');

module.exports = function(req, res, next){
	var addressId = req.param('id');

	Address.findOne({id : addressId}).then(function (foundAddress){

		if(foundAddress.coke_route == null && foundAddress.smb_route == null){
			next();
		}else{
			Routes.find({or : [{id : foundAddress.coke_route}, {id : foundAddress.smb_route}]}).then(function (foundRoutes){
				return res.send({message :'Can\'t delete. Address is assigned to a route', data : {routes : foundRoutes}}, 400);
			})
		}

	});
};