/**
 * Warehouse_transactionsController
 *
 * @description :: Server-side logic for managing warehouse_transactions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');
var Promise = require("bluebird");

module.exports = {
	add : function(req, res){
		var products = req.body.products;
		var user = req.body.user;
		var customer = req.body.customer_name;
		var amount = req.body.total_amount;

		var deposit = req.body.deposit;
		var returns =  req.body.returns;

		if(!deposit){
			deposit = 0;
		}
		
		ReturnsService.createReturns(returns, deposit)
			.then(function (returnId){
				return returnId;
			})

			.then(function warehouseSalesHandler(returnId){
				return WarehouseServices.createWarehouseTransaction(customer, amount, returnId, user, products);
			})

			.then(function (createdTransaction){
				sails.sockets.blast('warehouse_transactions', {verb : 'created', data : createdTransaction});
				return res.json({code : 1, message : 'Transaction completed'}, 200);	
			})			
	},

	getTransactionDetails : function(req, res){
		var transactionId = req.query.id;
		var transactionList = [];

		Warehouse_transaction_products.find({wtrans_id : transactionId}).populate("sku_id")
			.then(function (products){
				return products;
			})

			.each(function (product){
				return SkuService.getCompany(product.sku_id.id)
					.then(function (company){
						product.sku_id.company = company;
						transactionList.push(product);
					})
			})

			.then(function (){
				return res.send(transactionList);
			})
	}
};

