/**
 * AddressController
 *
 * @description :: Server-side logic for managing addresses
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 var Promise = require('bluebird');

module.exports = {
	remove : function(req, res){
		var address = req.body.address;
		var route = req.body.route;

		Address.findOne({id : address})
			.then(function removeRoute(foundAddress){
				return AddressService.removeRoute(foundAddress);
			})

			.then(function emitEvent(updatedAddress){
				var obj = {
					address : updatedAddress,
					route : route
				};

				sails.sockets.blast("address", {verb : "removed", data : obj});
				return res.send("Address removed from route " + route, 200);
			})

			.catch(function(err){
				return console.log(err);
			});
	},

	edit : function (req, res){
		var address = req.body.address;

		Address.update({id : address.id}, address)
			.then(function (updatedAddress){
				sails.sockets.blast("address", {verb : "updated", data : updatedAddress});
				return res.send(200);
			});
	},

	getList : function (req, res){
		Address.find()
			.then(function (addresses){
				return res.send(addresses);
			});
	}
};

