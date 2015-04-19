var Promise = require("bluebird");

module.exports = {
	removeRoute : function(address){
		return new Promise(function (resolve, reject){
			address.route_id = null;

			address.save(function (err, updatedAddress){
				if(err) reject(err);

				resolve(updatedAddress);
			});
		});
	}
};