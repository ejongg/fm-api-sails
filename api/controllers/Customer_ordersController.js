/**
 * Customer_ordersController
 *
 * @description :: Server-side logic for managing customer_orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');
var Promise = require("bluebird");

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

						Customer_orders.findOne({id : createdCustomerOrder.id}).populate('customer_id')
							.then(function(foundCustomerOrder){
								sails.sockets.blast('customer_orders', {verb : "created", data : foundCustomerOrder});
								return res.send(201);
							});

						sails.sockets.blast('customers',  {verb : "created", data : createdCustomer});							
					});
		});
	},

	list : function(req, res){
		var ordersWithProducts = [];

		Customer_orders.find().populate('customer_id')
			.then(function getOrders(orders){

				async.each(orders, function(order, cb){
					delete order.user;
					delete order.createdAt;
					delete order.updatedAt;

					Customer_order_products.find({order_id : order.id}).populate('sku_id')
						.then(function getProducts(products){
							ordersWithProducts.push({order : order, products : products});
							cb();							
						});					

				}, function(err){
					if(err)
						console.log(err);

					return res.send(ordersWithProducts);
				});

			}, 

			function(err){
				console.log(err);
			});
	},

	getOrderDetails : function(req, res){
		var orderId = req.query.id;
		var orderList = [];

		Customer_order_products.find({order_id : orderId}).populate("sku_id")
			.then(function (products){
				return products;
			})

			.each(function (product){
				return SkuService.getCompany(product.sku_id.id)
					.then(function (company){
						product.sku_id.company = company;
						orderList.push(product);
					})
			})

			.then(function (){
				return res.send(orderList);
			})
	}
};

