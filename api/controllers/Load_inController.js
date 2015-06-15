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
		var deliveryId = req.body.delivery;
		var totalAmount = req.body.total_amount;
		var notComplete = [];

		Delivery_transactions.update({id : deliveryId}, {status : "Complete"})
			.then(function (){
				return LoadInService.createLoadin(loadinNo, loadoutId, deliveryId, products);
			})

			.then(function (){
				return new Promise(function (resolve){
					Delivery_transactions.findOne({id : deliveryId}).then(function (foundDelivery){
						var newAmount = foundDelivery.total_amount - totalAmount;
						return Delivery_transactions.update({id : deliveryId}, {total_amount : newAmount});
					})

					.then(function (){
						resolve();
					})
				});
			})

			.then(function (){
				return Delivery_transactions.find({loadout_id : loadoutId});
			})

			.each(function (delivery){
				if(delivery.status != "Complete"){
					notComplete.push(delivery);
				}
			})

			.then(function (){
				if(notComplete.length == 0){
					return Load_out.update({id : loadoutId}, {status : "Complete"})
						.then(function (updatedLoadout){
							sails.sockets.blast('loadout', {verb : "completed", data : updatedLoadout});
						})
				}
			})

			.then(function (){
				return Customer_orders.update({delivery_id : deliveryId}, {status : "Delivered"});
			})

			.then(function (){
				sails.sockets.blast("inventory", {verb : "updated"});
				return res.send("Load in successful", 200);
			})
	},

	noLoadin : function (req, res){
		var loadoutId = req.body.loadout;
		var deliveryId = req.body.delivery;
		var notComplete = [];

		Delivery_transactions.update({id : deliveryId}, {status : "Complete"})
			.then(function (){
				return Delivery_transactions.find({loadout_id : loadoutId});
			})

			.each(function (delivery){
				if(delivery.status != "Complete"){
					notComplete.push(delivery);
				}
			})

			.then(function (){
				if(notComplete.length == 0){
					return Load_out.update({id : loadoutId}, {status : "Complete"})
						.then(function (updatedLoadout){
							sails.sockets.blast('loadout', {verb : "completed", data : updatedLoadout});
						})
				}
			})

			.then(function (){
				return Customer_orders.update({delivery_id : deliveryId}, {status : "Delivered"});
			})

			.then(function (){
				return res.send("Delivery marked complete", 200);
			})
	}
};

