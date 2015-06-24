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
							expense_id : expenseId,
							prod_date : product.prod_date,
							bay_id : product.bay_id
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
	},

	voidExpense : function (req, res){
		var expenseId = req.body.expense_id;
		var type = req.body.type;

		switch(type){
			case "Breakage":
				voidBreaksAndSpoils(expenseId);
				break;

			case "Spoilage":
				voidBreaksAndSpoils(expenseId);
				break;

			case "Broken Empties":
				voidEmptyExpenses(expenseId);
				break;

			default :
				Expenses.update({id : expenseId}, {status : 'Void'})
					.then(function (expense){
						sails.sockets.blast("expenses", {verb : "updated", data : expense[0]});
						return res.send('Expense now void', 200);
					})
		};

		function voidBreaksAndSpoils(expenseId){
			Expenses.update({id : expenseId}, {status : 'Void'})
				.then(function (expense){
					return ExpenseService.voidBreakageAndSpoilage(expenseId);
				})

				.then(function (updatedExpense){
					sails.sockets.blast('inventory', {verb : 'updated'});
					sails.sockets.blast("expenses", {verb : "updated", data : updatedExpense});
					return res.send('Expense now void', 200);
				})
		};

		function voidEmptyExpenses(expenseId){
			Expenses.update({id : expenseId}, {status : 'Void'})
				.then(function (expense){
					return ExpenseService.voidEmpties(expenseId);
				})

				.then(function (updatedExpense){
					sails.sockets.blast('empties', {verb : 'updated'});
					sails.sockets.blast("expenses", {verb : "updated", data : updatedExpense});
					return res.send('Expense now void', 200);
				})
		};
	}
};

