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
			date : moment().format('YYYY-MM-DD')
		};

		Bad_orders.create(bad_order)
			.exec(function(err, created_bad_order){
				(products).forEach(function(product){

					var item = {
						bad_order_id : 	created_bad_order.id,
						sku_id : product.sku_id,
						cases : product.cases,
						reason : product.reason
					};

					Bad_order_details.create(item)
						.exec(function(err, created_item){
							if(err) 
								console.log(err);
						});

					async.series([
						function deductInInventory(cb){
							InventoryService.deduct(product.sku_id, product.bottles, product.cases, product.bottlespercase);
							cb();	
						},

						function emit(cb){
							sails.sockets.blast('bad_orders', created_bad_order);
							return res.send(201);
							cb();
						}
					]);

				});
			});
	}
};

