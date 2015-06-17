var Promise = require('bluebird');

module.exports = function (req, res, next){
	var addressId = req.body.address;
	var route = req.body.route;

	Routes.findOne({id : route})
		.then(function (foundRoute){
			return foundRoute.company;
		})

		.then(function (company){
			var query = null;

			if(company == 'SMB'){
				query = {smb_route : route};
			}else{
				query = {coke_route : route};
			}

			return Address.find(query) ;
		})

		.then(function (foundAddresses){
			if(foundAddresses.length == 1){
				Trucks.findOne({route : route}).then(function (foundTruck){

					if(foundTruck){
						return res.send({message : "Can\'t delete route. Make sure it's not assigned to a truck"}, 400);
					}else{
						next();
					}
				})
			}else{
				next();
			}
		})
}