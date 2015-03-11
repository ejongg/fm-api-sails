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
						});
				}).value();
			});
	}
};

