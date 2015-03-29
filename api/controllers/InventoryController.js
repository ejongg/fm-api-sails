/**
 * InventoryController
 *
 * @description :: Server-side logic for managing inventories
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');

module.exports = {
	getInventory : function(req, res){
		var inventory = [];

		Inventory.find().populate('bay_id')
			.then(function(inventoryItems){
				return inventoryItems;
			})

			.then(function(inventoryItems){				
				async.each(inventoryItems, function(item, cb){

					Sku.findOne({id : item.sku_id}).populate('prod_id')
						.then(function(foundSku){
							item.company = foundSku.prod_id.company;
							item.brand_name = foundSku.prod_id.brand_name;
							item.sku_name = foundSku.sku_name;
							item.size = foundSku.size;

							inventory.push(item);
							cb();
						});
				},

				function(err){
					if(err)
						return res.send(err);

					return res.send(inventory);
				});
			});
	},

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

