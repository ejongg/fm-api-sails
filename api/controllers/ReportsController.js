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
				var query = {
					month : moment(date).format("MMMM"),
					day : moment(date).format("DD"),
					year : moment(date).format("YYYY")
				};

				Ending_inventory.findOne(query)
					.then(function (foundRecord){
						if(foundRecord){
							InventoryService.countInventory()
								.then(function (count){
									foundRecord.count = count;

									foundRecord.save(function (err, saved){
										dssr.ending_inventory = saved.count;
										cb();
									})
								})
						}else{
							InventoryService.countInventory()
								.then(function (count){
									var endingInventory = {
										month : moment(date).format("MMMM"),
										day : moment(date).format("DD"),
										year : moment(date).format("YYYY"),
										count : count
									}

									Ending_inventory.create(endingInventory)
										.then(function (createdEndingInventory){
											dssr.ending_inventory = createdEndingInventory.count;
											cb();
										})
								})
						}
					})
			},

			function getTotalPurchases(cb){
				var totalPurchases = 0;

				Purchases.find({date_received : date})
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

				Delivery_transactions.find({delivery_date : date})
					.then(function (deliveries){
						return deliveries;
					})

					.each(function (delivery){
						totalAmount = totalAmount + delivery.total_amount;
					})

					.then(function (){
						return Warehouse_transactions.find({date : date});
					})

					.each(function (transaction){
						totalAmount = totalAmount + transaction.total_amount;
					})

					.then(function (){
						dssr.stt = totalAmount;
						cb();
					})

			
			},

			function getTotalExpenses(cb){
				var totalExpenses = 0;

				Bad_orders.find({date : date})
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

				Returns.find({return_date : date}).populate("products")
					.then(function (returns){
						return returns;
					})

					.each(function computeAmount(returns){
						return new Promise(function (resolve, reject){
							ReturnsService.getTotalAmount(returns.products, function(err, result){
								if(err) reject(err);
								
								totalAmount = totalAmount + result;
								resolve(returns);
							});	
						});
					})

					.each(function (returns){
						totalAmount = totalAmount + returns.deposit;
					})

					.then(function addToDssr(){
						dssr.empties = totalAmount;
						cb();
					});
			}
		],

		function(err){
			if(err) return res.send(err);

			dssr.income = (dssr.stt + dssr.empties) - (dssr.purchases + dssr.expenses);

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