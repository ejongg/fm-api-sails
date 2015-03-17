/**
 * InventoryController
 *
 * @description :: Server-side logic for managing inventories
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');
var async = require('async');

module.exports = {
	dssr : function(req, res){
		var dssr = {};
		var date = moment().format('MM-DD-YYYY');

		async.parallel([
			function(cb){
				Inventory.find()
					.then(function getBeginningInventory(inventory_items){
						var total_count = 0;

						(inventory_items).forEach(function(item){
							total_count = total_count + item.physical_count;
						});

						dssr.beginning_inventory = total_count;

						cb();
					},

					function(err){
						console.log(err);

						cb();
					});
			},

			function(cb){
				Purchases.find({date_received : date})
					.then(function getTotalPurchases(purchases){
						var total_purchases = 0;

						(purchases).forEach(function(purchase){
							total_purchases = total_purchases + purchase.total_cost;
						});

						dssr.total_purchases = total_purchases;

						cb();
					}, 

					function(err){
						console.log(err);

						cb();
					});				
			},

			function(cb){
				Bad_orders.find({date : date})
					.then(function getTotalExpenses(bad_orders){
						var total_expense = 0;

						(bad_orders).forEach(function(bad_order){
							total_expense = total_expense + bad_order.expense;
						});

						dssr.total_expense = total_expense;

						cb();
					},

					function(err){
						console.log(err);

						cb();
					});
			}
		],function(err){

			return res.send(dssr);
		});	
	}
};

