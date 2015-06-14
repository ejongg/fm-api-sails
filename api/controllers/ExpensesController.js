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

		switch(type){
			case "Breakage":
				BreakAndSpoilExpense();
				break;

			case "Spoilage":
				BreakAndSpoilExpense();
				break;

			case "Broken Empties":
				BrokenEmpties();
				break;

			default :
				Expenses.create({type : type, amount : amount, date : date, user : user})
				.then(function (expense){
					sails.sockets.blast("expenses", {verb : "created", data : expense});
					return res.send(201);
				})
		};

		function BrokenEmpties(){
			var empties = req.body.empties;
			var expenseId = null;

			Expenses.create({type : type, amount : amount, date : date, user : user})
				.then(function (expense){
					expenseId = expense.id;
					return empties;
				})

				.each(function (empty){
					return new Promise(function (resolve){
						var expenseProduct = {
							sku_id : empty.sku_id,
							bottles : empty.return_empties_bottles,
							cases : empty.return_empties_cases,
							expense_id : expenseId
						};

						Expense_products.create(expenseProduct)
							.then(function (){
								return EmptiesService.deduct(empty.sku_id, empty.return_empties_cases, empty.return_empties_bottles, empty.bottlespercase);
							})

							.then(function (){
								resolve();
							})
					});
				})

				.then(function (){
					Expenses.findOne({id : expenseId})
						.then(function (expense){
							sails.sockets.blast('empties', {verb : 'updated'});
							sails.sockets.blast("expenses", {verb : "created", data : expense});
							return res.send(201);
						})
				})
		};

		function BreakAndSpoilExpense(){
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
								return InventoryService.deductSpecificProduct(product.sku_id, product.bottles, product.cases, product.bottlespercase, product.bay_id, product.prod_date);
							})

							.then(function (){
								resolve();
							})
					});
				})

				.then(function (){
					Expenses.findOne({id : expenseId})
						.then(function (expense){
							sails.sockets.blast('incomplete_cases', {verb : 'updated'});
							sails.sockets.blast('inventory', {verb : 'updated'});
							sails.sockets.blast("expenses", {verb : "created", data : expense});
							return res.send(201);
						})
				})
		};
	}
};

