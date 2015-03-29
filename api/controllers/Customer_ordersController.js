/**
 * Customer_ordersController
 *
 * @description :: Server-side logic for managing customer_orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');

module.exports = {
	add : function(req, res){
		var customer  = req.body.customer;
		var orders = req.body.orders;
		var supplierAgentName = req.body.supplieragent_name;
		var user = req.body.user;
		var totalAmount = req.body.total_amount;

		var customerDetails = {
			establishment_name : customer.establishment,
			owner_name : customer.owner,
			address : customer.address,
			distance : customer.distance
		};

		Customers.findOrCreate({establishment_name : customer.establishment}, customerDetails)
			.exec(function(err, createdCustomer){

				if(err)
					return res.send(err);

				var customerOrder = {
					customer_id : createdCustomer.id,
					supplieragent_name : supplierAgentName,
					date_received : moment().format('YYYY-MM-DD'),
					user  : user,
					total_amount : totalAmount
				};

				Customer_orders.create(customerOrder)
					.exec(function(err, createdCustomerOrder){
						if(err)
							return res.send(err);

						_(orders).forEach(function(order){

							var orderProduct = {
								order_id : createdCustomerOrder.id,
								sku_id : order.sku_id,
								cases : order.cases
							};

							Customer_order_products.create(orderProduct)
								.exec(function(err, createOrderProduct){
									if(err)
										return res.send(err);
								});
						});

						sails.sockets.blast('customer_orders', {verb : "created", data : createdCustomerOrder});							
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

