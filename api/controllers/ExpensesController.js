/**
 * ExpensesController
 *
 * @description :: Server-side logic for managing expenses
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 var Promise = require('bluebird');

module.exports = {
	add : function (req, res){
		var type = req.body.type;
		var amount = req.body.amount;
		var date = req.body.date;
		var user = req.body.user;

		if(type == "Breakage" || type == "Spoilage"){
			var products = req.body.products;
			var expenseId = null;

			Expenses.create({type : type, amount : amount, date : date, user : user})
				.then(function (expense){
					expenseId = expense.id;
					return products;
				})

				.each(function (product){
					return new Promise(function (resolve, reject){
						var expenseProduct = {
							sku_id : product.sku_id,
							bottles : product.bottles,
							cases : product.cases,
							expense_id : expenseId
						};

						Expense_products.create(expenseProduct)
							.then(function (){
								return InventoryService.deductInSpecificBay(product.sku_id, product.bottles, product.cases, product.bottlespercase, product.bay_id);
							})

							.then(function (){
								resolve();
							})
					});
				})

				.then(function (){
					Expenses.findOne({id : expenseId})
						.then(function (expense){
							sails.sockets.blast('inventory', {verb : 'updated'});
							sails.sockets.blast("expenses", {verb : "created", data : expense});
							return res.send(201);
						})
				})	
		}else{

			Expenses.create({type : type, amount : amount, date : date, user : user})
				.then(function (expense){
					sails.sockets.blast("expenses", {verb : "created", data : expense});
					return res.send(201);
				})
		}
	}
};

