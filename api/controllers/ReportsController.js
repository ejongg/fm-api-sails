/*
	This controller is for generating reports that 
	are requested.
*/
var moment = require('moment');
var Promise = require('bluebird');
module.exports = {
	getDssr : function(req, res){
		var dssr = {};
		var date = req.query.date;

		if(!date){
			date = moment().format("YYYY-MM-DD");
		}

		async.parallel([
			function getBeginningInventory(cb){

				if(moment().format("DD") === 1){
					InventoryService.countInventory()
						.then(function (totalCount){
							var beginningInventory = {
								month : moment().format("MMMM") ,
								year : moment().format("YYYY") ,
								count : totalCount 
							};

							Beginning_inventory.create(beginningInventory)
								.then(function (newBeginningInventory){
									dssr.beginning_inventory = totalCount;
									cb();
								})
						})

				}else{
					var inventoryDate = {
						month : moment(date).format("MMMM"),
						year : moment(date).format("YYYY")
					}

					Beginning_inventory.findOne(inventoryDate)
					 .then(function (result){

					 	if(result){
					 		dssr.beginning_inventory = result.count;	
					 		cb();
					 	}else{
					 		InventoryService.countInventory()
					 			.then(function (totalCount){
					 				var beginningInventory = {
					 					month : moment().format("MMMM") ,
					 					year : moment().format("YYYY") ,
					 					count : totalCount 
					 				};

					 				Beginning_inventory.create(beginningInventory)
					 					.then(function (newBeginningInventory){
					 						dssr.beginning_inventory = totalCount;
					 						cb();
					 					})
					 			})
					 	}					 	
					 })
				}

			},

			function getEndingInventory(cb){
				var totalCount = 0;
				Inventory.find()
					.then(function (items){
						return items;
					})

					.each(function (item){
						totalCount = totalCount + item.physical_count;
					})

					.then(function (){
						dssr.ending_inventory = totalCount;
						cb();
					})
			},

			function getTotalPurchases(cb){
				var totalPurchases = 0;

				Purchases.find()
					.then(function (purchases){
						return purchases;	
					})

					.each(function (purchase){
						totalPurchases = totalPurchases + purchase.total_amount;
					})

					.then(function (){
						dssr.purchases = totalPurchases;
						cb();
					})				
			},

			function getSTT(cb){
				var totalAmount = 0;

				Delivery_transactions.find()
					.then(function (deliveries){
						return deliveries;
					})

					.each(function (delivery){
						totalAmount = totalAmount + delivery.total_amount;
					})

					.then(function (){
						dssr.deliveries = totalAmount;
						cb();
					})
			},

			function getTotalExpenses(cb){
				var totalExpenses = 0;

				Bad_orders.find()
					.then(function (badOrders){
						return badOrders;
					})

					.each(function (badOrder){
						totalExpenses = totalExpenses + badOrder.expense;
					})

					.then(function (){
						dssr.expenses = totalExpenses;
						cb();
					});
			},

			function getEmpties(cb){
				var totalAmount = 0;

				Returns.find().populate("products")
					.then(function (returns){
						return returns;
					})

					.each(function computeAmount(returns){
						return new Promise(function (resolve, reject){
							ReturnsService.getTotalAmount(returns.products, function(err, result){
								if(err) reject(err);
								
								totalAmount = totalAmount + result;
								resolve();
							});	
						});
					})

					.then(function addToDssr(){
						dssr.empties = totalAmount;
						cb();
					});
			},

			function getIncome(cb){
				

				cb();
			}
		],

		function(err){
			if(err) return res.send(err);

			return res.send(dssr);
		});	
	},

	getTransactions : function(req, res){
		var transactions = [];
		var date = req.query.date;

		if(!date){
			date = moment().format("YYYY-MM-DD");
		}

		function getWarehouseTransactions(){
			return new Promise(function (resolve, reject){
				Warehouse_transactions.find()
					.then(function (warehouseTransactions){
						return warehouseTransactions;
					})

					.each(function (transaction){
						transaction.type = "Warehouse sales";
						transactions.push(transaction);
					})

					.then(function (){
						resolve();
					})
			});
		}
		
		function getDeliveryTransactions(){
			return new Promise(function (resolve, reject){
				Delivery_transactions.find().populateAll()
					.then(function (deliveryTransactions){
						return deliveryTransactions;
					})

					.each(function (transaction){
						transaction.type = "Delivery";
						transactions.push(transaction);
					})

					.then(function (){
						resolve();
					})
			});
		}

		getWarehouseTransactions()
			.then( getDeliveryTransactions )
			.then( function (){
				return res.send(transactions);
			});
	}
}