/**
 * Customer_ordersController
 *
 * @description :: Server-side logic for managing customer_orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var _ = require('lodash');
var moment = require('moment');
var async = require('async');

module.exports = {
	add : function(req, res){
		var customer  = req.body.customer;
		var orders = req.body.orders;
		var supplieragent_name = req.body.supplieragent_name;
		var user = req.body.user;
		var total_amount = req.body.total_amount;

		var customer = {
			establishment_name : customer.establishment,
			owner_name : customer.owner,
			address : customer.address,
			distance : customer.distance
		};

		Customers.findOrCreate({establishment_name : customer.establishment}, customer)
			.exec(function(err, new_customer){

			if(err)
				res.json({error : 'An error has occured'});

			Customer_orders.create({
				customer_id : new_customer.id,
				supplieragent_name : supplieragent_name,
				date_received : moment().format('YYYY-MM-DD'),
				user  : user,
				total_amount : total_amount
			}).exec(function(err, new_cust_order){
				if(err)
					res.json({error : 'An error has occured'});

				(orders).forEach(function(order){
					order.order_id = new_cust_order.id;
					delete order.sku;
					delete order.$$hashKey;
				});

				Customer_order_products.create(orders)
					.exec(function(err, new_orders){
						if(err)
							res.json({error : 'An error has occured'});

						Customer_orders.findOne({id : new_cust_order.id}).populate('customer_id')
							.exec(function(err, populated_cust_order){

								sails.sockets.blast('customer_orders', {verb : 'created', data : populated_cust_order});								
							});

					});				
			});
		});
	},

	list : function(req, res){
		var orders_with_products = [];

		Customer_orders.find().populate('customer_id')
			.then(function getOrders(orders){

				async.each(orders, function(order, cb){
					delete order.user;
					delete order.createdAt;
					delete order.updatedAt;

					Customer_order_products.find({order_id : order.id}).populate('sku_id')
						.then(function getProducts(products){
							orders_with_products.push({order : order, products : products});
							cb();							
						});					

				}, function(err){
					if(err)
						console.log(err);

					return res.send(orders_with_products);
				});

			}, 

			function(err){
				console.log(err);
			});
	}
};

