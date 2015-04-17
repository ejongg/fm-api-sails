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
			.then(function removeRouteOfAddress(foundAddress){
				return new Promise(function(resolve, reject){
					foundAddress.route_id = '';
					foundAddress.save(function(err, saved){
						if(err) reject(err);

						resolve(saved);
					});
				});				
			})

			.then(function emitEvent(updatedAddress){
				var obj = {
					address : updatedAddress,
					route : route
				};

				sails.sockets.blast('address', {verb : 'created', data : obj});
				return res.send("Address removed from route " + route, 200);
			})

			.catch(function(err){
				return res.send(err);
			});
	},

	getList : function (req, res){
		Address.find()
			.then(function (addresses){
				return res.send(addresses);
			});
	}
};

