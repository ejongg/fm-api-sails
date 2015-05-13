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

		Load_out.findOne({id : loadoutId})
			.then(function (loadout){
				return LoadOutService.changeStatus(loadout);
			})

			.then(function (){
				return DeliveryService.completeDeliveries(loadoutId);
			})

			.then(function (){
				return LoadInService.createLoadin(loadinNo, loadoutId, products);
			})

			.then(function (){
				return res.send("Load in successful", 200);
			})
	}
};

