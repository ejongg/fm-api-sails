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
		var allProductsAvailable = false;

		/**
		*	Check if the inventory has enough supplies
		*	of the products being requested.
		*/
		function checkAvailability(callback){
			var notAvailableProducts = [];
			
			/**
			*	Iterate on each products checking if
			*	the inventory can accomodate the requested
			*	number of products
			*/
			async.each(products, function(product, cb){
				Inventory.find({sku_id : product.sku_id})
					.exec(function(err, found_sku){
						if(found_sku){
							var sku_total_case_count = 0;

							/**
							*	Find all instances of sku adding them all
							*	together
							*/
							_(found_sku).forEach(function(sku){
								sku_total_case_count = sku_total_case_count + sku.physical_count;
							}).value();

							/**
							*	Check if the number of request product is greater than the total
							*	count of the product in the inventory. If yes add that product to 
							*	the array notAvailableProducts
							*/
							if(product.cases > sku_total_case_count){
								notAvailableProducts.push(product.sku_name);
								cb();
							}else{
								cb();
							}

						/**
						* If the product is not found in the inventory send an error message.
						*/
						}else{
							res.json({message : product.sku_name + ' not found in inventory'});
							cb(product.sku_name + ' not found in inventory');
						}
					});

			}, function(err){
				if(err)
					console.log(err);

				/**
				*	Check if there are products in the array notAvailableProducts.
				*	If there is do not proceed with the transaction but if everything
				*	is ok then proceed with the transaction
				*/
				if(notAvailableProducts.length === 0){
					callback(true);
				}else{
					res.json({message : 'Insufficient stocks in warehouse', data : notAvailableProducts});
					callback(false);
				}
			});
		};
		
		async.series([
			function(cb){
				/**
				*	Execute the function that was defined above then
				*	use the callback of the function to determine if 
				*	the transaction shall proceed
				*/
				checkAvailability(function(allProductsAvailable){
					cb(null, allProductsAvailable);
				})
			}
		], function(err, result){
			var proceed = result[0];

			if(proceed){
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
						_(returns).forEach(function(product){

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
						}).value();

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
								_(products).forEach(function(product){

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
									Inventory.find({sku_id : trans_item.sku_id})
										.exec(function(err, skus){
											if(err)
												console.log(err);

											var cases_sold = trans_item.cases;
											var index = 0;

											do {
												var current_sku_count = skus[index].physical_count;

												skus[index].physical_count = Math.max(0, skus[index].physical_count - cases_sold);
												skus[index].logical_count = Math.max(0, skus[index].logical_count - cases_sold);
												skus[index].save(function(err, saved){});

												if(cases_sold < skus[index].physical_count){
													cases_sold = 0;
												}else{
													cases_sold = cases_sold - current_sku_count;
													index++;
												}
											}while(cases_sold != 0);
										});
								}).value();
							});
					});
			}
		});			
	}
};

