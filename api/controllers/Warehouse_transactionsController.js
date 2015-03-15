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

		if(req.result){
			/**
			*	Create the returns of the transaction
			*/
			Returns.create({return_date : moment().format('MM-DD-YYYY')})
				.exec(function(err, created_returns){
					/**
					*	After created the returns record 
					*	add the products of the returns
					*	to the database
					*/
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

					/**
					*	Create the warehouse transaction
					*/
					var wh_transaction = {
						customer_name : customer_name,
						date : moment().format('MM-DD-YYYY'),
						return_id : created_returns.id,
						total_amount : total_amount,
						user : user
					};

					Warehouse_transactions.create(wh_transaction)
						.exec(function(err, created_transaction){
							if(err)
								console.log(err);
							/**
							*	Create the products associated with the 
							*	transaction
							*/
							(products).forEach(function(product){

								var trans_item = {
									wtrans_id : created_transaction.id,
									sku_id : product.sku_id,
									bottles : product.bottles,
									cases : product.cases
								};

								Warehouse_transaction_products.create(trans_item)
									.exec(function(err, created_trans_product){
										if(err)
											console.log(err);
									});

								/**
								*	After creating the product associated with the
								*	transaction. Deduct the number of cases bought
								*	to the inventory
								*/
								Inventory.find({sku_id : product.sku_id})
									.exec(function(err, skus){
										if(err)
											console.log(err);

										var cases_sold = product.cases;
										var extra_bottles = product.bottles;
										var bottlespercase = product.bottlespercase;
										var index = 0;

										async.whilst(
											function whileCondition(){return cases_sold > 0},

											function bottlesAndCasesHandler(cb_whilst){
												var current_physical_cases = skus[index].physical_count;
												var current_bottles = skus[index].bottles;

												async.series([
													function bottlesHandler(cb_outer_series){
														if(current_bottles > 0){

															async.series([
																function deductBottles(cb_inner_series){
																	skus[index].bottles = Math.max(0, skus[index].bottles - extra_bottles);
																	skus[index].bottles = Math.max(0, skus[index].bottles - (cases_sold * bottlespercase));	
																	skus[index].save(function(err, saved){});

																	cb_inner_series();
																},

																function deductCaseOfBottles(cb_inner_series){
																	if((skus[index].bottles - (skus[index].physical_count * bottlespercase)) < bottlespercase){
																		skus[index].physical_count = skus[index].physical_count - 1;
																		skus[index].logical_count = skus[index].logical_count - 1;																		
																	}

																	cb_inner_series();																															
																}
															], function endOfInnerSeries(err, result){
																cb_outer_series();
															});																			
														}else{
															cb_outer_series();
														}
													},

													function casesHandler(cb_outer_series){
														if(current_physical_cases > 0){																									
															skus[index].physical_count = Math.max(0, skus[index].physical_count - cases_sold);
															skus[index].logical_count = Math.max(0, skus[index].logical_count - cases_sold);
															skus[index].save(function(err, saved){});

															if(cases_sold < skus[index].physical_count){
																cases_sold = 0;
																cb_outer_series();
															}else{
																cases_sold = cases_sold - current_physical_cases;
																index++;
																cb_outer_series();
															}

														}else{
															index++;
															cb_outer_series();
														}
													}
												]);

												cb_whilst();
											},

											function endOfWhile(err){
												if(err)
													console.log(err);

												sails.sockets.blast('warehouse_transactions', {verb : 'created', data : created_transaction});
												return res.json({code : 1, message : 'Transaction completed'});
											}
										); // end of async.whilst
									});
							});
						});
				});
		}			
	}
};

