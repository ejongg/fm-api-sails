/**
 * Warehouse_transactionsController
 *
 * @description :: Server-side logic for managing warehouse_transactions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');
var _ = require('lodash');
var async = require('async');

module.exports = {
	add : function(req, res){
		var products = req.body.products;
		var returns =  req.body.returns;
		var customer_name = req.body.customer_name;
		var user = req.body.user;
		var total_amount = req.body.total_amount;

		Returns.create({return_date : moment().format('MM-DD-YYYY')})
			.then(function returnsHandler(created_returns){

				(returns).forEach(function(product){

					var item = {
						return_id : created_returns.id,
						sku_id : product.sku_id,
						bottles : product.bottles,
						cases : product.cases,
						deposit : product.deposit
					};

					Returns_products.create(item).exec(function(err, created_return_item){
						if(err)
							console.log(err);
					});
				});

				return created_returns;
			})

			.then(function warehouseSalesHandler(created_returns){
				var warehouse_transaction = {
					customer_name : customer_name,
					date : moment().format('MM-DD-YYYY'),
					return_id : created_returns.id,
					total_amount : total_amount,
					user : user
				};

				Warehouse_transactions.create(warehouse_transaction)
					.then(function(created_transaction){
						
						(products).forEach(function(product){

							var sales_item = {
								wtrans_id : created_transaction.id,
								sku_id : product.sku_id,
								bottles : product.bottles,
								cases : product.cases
							};

							async.parallel([
								function createTransactionItem(cb){
									Warehouse_transaction_products.create(sales_item)
										.exec(function(err, created_trans_product){
											if(err)
												console.log(err);
										});
									cb();
								},

								function updateInventory(cb){
									InventoryService.updateInventory(product.sku_id, product.bottles, product.cases, product.bottlespercase);
									cb();
								}

							]);
							
						});

						sails.sockets.blast('warehouse_transactions', {verb : 'created', data : created_transaction});
						return res.json({code : 1, message : 'Transaction completed'});	
					},

					function(err){
						console.log(err);
					});
			})

			.catch(function(e){
				console.log(e);
			})				
	}
};

