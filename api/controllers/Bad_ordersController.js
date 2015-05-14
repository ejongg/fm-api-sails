/**
 * Bad_ordersController
 *
 * @description :: Server-side logic for managing bad_orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var moment = require('moment');
var Promise = require("bluebird");

module.exports = {
	add : function(req, res){
		var products = req.body.products;
		var expense = req.body.total_expense;
		var accountable = req.body.accountable;

		BadOrdersService.createBadOrder(expense, accountable, products)
			.then(function (createdBadOrder){
				sails.sockets.blast('bad_orders', {verb : "created", data : createdBadOrder});
				return res.send("Bad order recorded", 201);
			})
	},

	getBadOrderProducts : function(req, res){
		var badOrderId = req.query.id;
		var badOrdersList = [];

		Bad_order_details.find({bad_order_id : badOrderId}).populate("sku_id")
			.then(function (products){
				return products;
			})

			.each(function (product){
				return SkuService.getProductName(product.sku_id.id)
					.then(function (brandName){
						product.sku_id.brand_name = brandName;
						badOrdersList.push(product);
					})
			})

			.then(function (){
				return res.send(badOrdersList);
			})
	}
};

