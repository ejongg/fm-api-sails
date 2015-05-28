var Promise = require('bluebird');

module.exports = {
	checkIfEmpty : function(routeId){
		return new Promise(function (resolve){
			Address.find({route_id : routeId})
				.then(function (addressList){					
					if(addressList.length == 0){
						return Routes.destroy({id : routeId});
					}
				})

				.then(function (){
					resolve();
				})
		});
	}
};