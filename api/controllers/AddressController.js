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

		Routes.findOne({id : route})
			.then(function (foundRoute){
				return foundRoute.company;
			})

			.then(function (company){
				var obj = null;

				if(company == 'SMB'){
					obj = {smb_route : null};
				}else{
					obj = {coke_route : null};
				}

				return [Address.update({id : addressId}, obj), company];
			})

			.spread(function (updatedAddress, company){
				RoutesService.checkIfEmpty(route, company)
					.then(function (){
						return Routes.findOne({id : route});						
					})

					.then(function (foundRoute){
						var data = {
							address : updatedAddress,
							route : route
						};

						sails.sockets.blast("address", {verb : "removed", data : data});
						return res.send("Address removed from route " + route, 200);
					})

			})

			.catch(function (err){
				return res.send(err);
			})
		
	},

	edit : function (req, res){
		var address = req.body.address;

		Address.update({id : address.id}, address)
			.then(function (updatedAddress){
				sails.sockets.blast("address", {verb : "updated", data : updatedAddress});
				return res.send("Address updated",200);
			})

			.catch(function(err){
				return res.send(err);
			});;
	},

	getList : function (req, res){
		var company = req.query.company;

		var query = null;

		if(company == 'Coca-Cola'){
			query = {coke_route : null};
		}else{
			query = {smb_route : null};
		}

		Address.find(query)
			.then(function (addresses){
				return res.send(addresses);
			});
	},

	listAll : function (req, res){

		Address.find().then(function (addresses){
			return res.send(addresses);
		})
	}
};

