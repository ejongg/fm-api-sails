/*
	This controller is for generating reports that 
	are requested.
*/
var moment = require('moment');

module.exports = {
	getDssr : function(req, res){
		var dssr = {};
		var date = moment().format("YYYY-MM-DD");

		async.parallel([
			function getBeginningInventory(cb){
				Inventory.find()
					.then(function (inventory_items){
						var totalCount = 0;

						_(inventory_items).forEach(function(item){
							totalCount = totalCount + item.physical_count;
						});

						dssr.beginning_inventory = totalCount;
						cb();
					},

					function(err){
						return res.send(err);
					});
			},

			function getTotalPurchases(cb){
				Purchases.find({date_received : date})
					.then(function (purchases){
						var totalPurchases = 0;

						(purchases).forEach(function(purchase){
							totalPurchases = totalPurchases + purchase.total_cost;
						});

						dssr.total_purchases = totalPurchases;
						cb();
					}, 

					function(err){
						return res.send(err);
					});				
			},

			function getTotalExpenses(cb){
				Bad_orders.find({date : date})
					.then(function (bad_orders){
						var totalExpense = 0;

						(bad_orders).forEach(function(bad_order){
							totalExpense = totalExpense + bad_order.expense;
						});

						dssr.total_expense = totalExpense;
						cb();
					},

					function(err){
						return res.send(err);
					});
			}
		],

		function(err){
			if(err) return res.send(err);

			return res.send(dssr);
		});	
	},

	getTransactions : function(req, res){
		var transactions = {};
		var date = req.query.date;

		if(!date){
			date = moment().format("YYYY-MM-DD");
		}

		async.parallel([
			function getWarehouseTransactions (cb){
				Warehouse_transactions.find({date : date})
					.then(function (warehouseTransactions){
						transactions.warehouse = warehouseTransactions;
						cb();
					},

					function(err){
						return res.send(err);
					});
			},

			function getDeliveryTransactions (cb){
				Delivery_transactions.find({delivery_date : date}).populateAll()
					.then(function (deliveryTransactions){
						transactions.delivery = deliveryTransactions;
						cb();
					},

					function(err){
						return res.send(err);
					});
			}
		],

		function(err){
			if(err) 
				return res.send(err);

			return res.send(transactions);
		});
	}
}