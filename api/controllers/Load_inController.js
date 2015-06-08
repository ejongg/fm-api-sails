/**
 * Load_inController
 *
 * @description :: Server-side logic for managing load_ins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var moment = require('moment');
var Promise = require('bluebird');

module.exports = {
	
	add : function(req, res){
		var products = req.body.products;
		var loadoutId = req.body.loadout;
		var loadinNo = req.body.loadin_no;
		var customerId = req.body.customer_id;

		Load_out.update({id : loadoutId}, {status : "Complete"})
			.then(function (updatedLoadout){
				sails.sockets.blast('loadout', {verb : "updated", data : updatedLoadout});
				return DeliveryService.completeDeliveries(loadoutId);
			})

			.then(function (){
				return LoadInService.createLoadin(loadinNo, loadoutId, customerId, products);
			})

			.then(function (){
				return res.send("Load in successful", 200);
			})
	},

	noLoadin : function (req, res){
		var loadoutId = req.body.loadout;

		Load_out.update({id : loadoutId}, {status : "Complete"})
			.then(function (updatedLoadout){
				sails.sockets.blast('loadout', {verb : "updated", data : updatedLoadout});
				return DeliveryService.completeDeliveries(loadoutId);
			})

			.then(function (){
				return res.send("Load in successful", 200);
			})
	}
};

