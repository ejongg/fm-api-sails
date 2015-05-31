/**
 * AddressController
 *
 * @description :: Server-side logic for managing addresses
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Promise = require('bluebird');

module.exports = {
	remove : function(req, res){
		var addressId = req.body.address;
		var route = req.body.route;

		Address.update({id : addressId}, {route_id : null})
			.then(function (updatedAddress){
				
				var data = {
					address : updatedAddress,
					route : route
				};

				RoutesService.checkIfEmpty(route)
					.then(function (){
						sails.sockets.blast("address", {verb : "removed", data : data});
						return res.send("Address removed from route " + route, 200);
					})
			})

		
	},

	edit : function (req, res){
		var address = req.body.address;

		Address.update({id : address.id}, address)
			.then(function (updatedAddress){
				sails.sockets.blast("address", {verb : "updated", data : updatedAddress});
				return res.send(200);
			})

			.catch(function(err){
				return res.send(err);
			});;
	},

	getList : function (req, res){
		Address.find({route_id : null})
			.then(function (addresses){
				return res.send(addresses);
			});
	}
};

