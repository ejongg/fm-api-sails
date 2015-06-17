var Promise = require('bluebird');

module.exports = {
	checkIfEmpty : function(routeId, company){
		return new Promise(function (resolve){
			var obj = null;

			if(company == 'SMB'){
				obj = {smb_route : routeId};
			}else{
				obj = {coke_route : routeId};
			}

			Address.find(obj)
				.then(function (addressList){					
					if(addressList.length == 0){
						return Routes.destroy({id : routeId});
					}
				})

				.then(function (destroyedRoute){
					if(destroyedRoute){
						destroyedRoute[0].id = destroyedRoute[0].route_id;
						delete destroyedRoute[0].route_id;

						sails.sockets.blast('routes', {verb : 'destroyed', data : destroyedRoute});
						resolve(destroyedRoute[0])
					}else{
						resolve();
					}
				})
		});
	}
};