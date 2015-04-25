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

		var bad_order = {
			expense : req.body.total_expense,
			accountable : req.body.accountable,
			date : moment().format('YYYY-MM-DD')
		};

		Bad_orders.create(bad_order)
			.then(function (createdBadOrder){
				return new Promise(function (resolve, reject){
					BadOrdersService.createBadOrderProducts(products, createdBadOrder.id)
						.then(function (){
							resolve(createdBadOrder);
						})
				});			
			})

			.then(function (createdBadOrder){
				sails.sockets.blast('bad_orders', {verb : "created", data : createdBadOrder});
				return res.send(201);
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
					.then(function (brand_name){
						product.sku_id.brand_name = brand_name;
						badOrdersList.push(product);
					})
			})

			.then(function (){
				return res.send(badOrdersList);
			})
	}
};

