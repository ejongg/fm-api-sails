module.exports = {
	checkIfEmpty : function(routeId){
		Address.find({route_id : routeId})
			.then(function (addressList){
				if(addressList.length < 0){
					return Routes.destroy({id : routeId});
				}
			})
	}
};