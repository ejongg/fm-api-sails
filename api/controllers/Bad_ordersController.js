/**
 * Bad_ordersController
 *
 * @description :: Server-side logic for managing bad_orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var moment = require('moment');

module.exports = {
	add : function(req, res){
		var products = req.body.products;

		var bad_order = {
			expense : req.body.total_expense,
			accountable : req.body.accountable,
			date : moment().format('MM-DD-YYYY')
		};

		Bad_orders.create(bad_order)
			.exec(function(err, created_bad_order){
				_(products).forEach(function(product){
					var item = {
						bad_order_id : 	created_bad_order.id,
						sku_id : product.sku_id,
						cases : product.cases,
						reason : product.reason
					};

					Bad_order_details.create(item)
						.exec(function(err, created_bad_order_item){
							/**
							*	TODO : Deduct the number of cases that was
							*	considered as bad order in the inventory
							*
							*	Question: How to determine what spefic item
							*	in the inventory was labeled as bad order
							*/
							async.series([
								function deductInInventory(cb){
									if(typeof product.bay_id == 'number'){
										Inventory.findOne({sku_id : product.sku_id, bay_id : product.bay_id})
											.exec(function(err, found_sku){
												found_sku.bottles = found_sku.bottles - (product.cases * product.bottlespercase);
												found_sku.physical_count = found_sku.physical_count - product.cases;
												found_sku.logical_count = found_sku.logical_count - product.cases;
												found_sku.save(function(err, saved){});
											});
										cb();	
									}else{
										cb();
									}
								},

								function emit(cb){
									sails.sockets.blast('bad_orders', created_bad_order);
									return res.send(201);
									cb();
								}
							]);
							
							
						});
				}).value();
			});
	}
};

