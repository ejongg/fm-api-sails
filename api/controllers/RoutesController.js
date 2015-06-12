/**
 * RoutesController
 *
 * @description :: Server-side logic for managing routes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Promise = require('bluebird');

module.exports = {
	add : function(req, res){
		var routeName = req.body.route_name;
		var addressList = req.body.address;
		var company = req.body.company;
		var flag = req.body.flag;

		var query = {
			route_name : routeName, 
			company : company
		};

		Routes.findOrCreate(query, query).then(function (route){
			return updateAddresses(route);
		})

		.then(function (route){
		
			var comp = null;

			if(company == "Coca-Cola"){
				comp = 'coke_address';
			}else{
				comp = 'smb_address';
			}

			return Routes.findOne({id : route.id}).populate(comp);
		})

		.then(function (foundRoute){
			if(flag == 'add'){
				sails.sockets.blast('routes', {verb : 'created', data : foundRoute});	
			}else{
				sails.sockets.blast('routes', {verb : 'updated', data : foundRoute});	
			}

			return res.send('Success', 200);
		})

		function updateAddresses(route){
			return new Promise(function (resolve){

				new Promise(function (resolve){
					resolve(addressList);
				})

				.each(function (address){
					var addressRoute;

					if(company == 'Coca-Cola'){
						addressRoute = {coke_route : route.id};
					}else{
						addressRoute = {smb_route : route.id};
					}

					return Address.update({id : address.id}, addressRoute);
				})

				.then(function (){
					resolve(route);
				})

			});
		};
	},

	remove : function(req, res){
		var routeId = req.query.id;

		Routes.findOne({id : routeId}).populateAll()
			.then(function (foundRoute){

				Routes.destroy({id : routeId})
					.then(function (destroyedRoute){
						sails.sockets.blast('routes', {verb : 'destroyed', data : foundRoute});
						return res.send(destroyedRoute);
					})
			})
	} 
};

