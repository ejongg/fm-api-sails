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

		var createCustomer = {
			establishment_name : customer.establishment,
			owner_name : customer.owner,
			address : customer.address,
			distance : customer.distance
		};

		var orderId = null;
		var customerBlast = null;

		Customers.findOrCreate({establishment_name : customer.establishment}, createCustomer)
			.then(function(resultCustomer){
				customerBlast = resultCustomer;

				return new Promise(function (resolve, reject){
					var customerOrder = {
						customer_id : resultCustomer.id,
						supplieragent_name : supplierAgentName,
						date_received : moment().format('YYYY-MM-DD'),
						user  : user,
						total_amount : totalAmount
					};

					Customer_orders.create(customerOrder)
						.then(function (createdOrder){
							orderId = createdOrder.id;
							resolve(orders);
						})
				});

			})

			.each(function (order){
				var orderProduct = {
					order_id : orderId,
					sku_id : order.sku_id,
					cases : order.cases
				};

				return Customer_order_products.create(orderProduct);
			})

			.then(function (){

				Customer_orders.findOne({id : orderId}).populate('customer_id')
					.then(function(foundCustomerOrder){
						sails.sockets.blast('customer_orders', {verb : "created", data : foundCustomerOrder});
						sails.sockets.blast('customers',  {verb : "created", data : customerBlast});
						return res.send(201);
					});
			})	
	},

	list : function(req, res){
		var ordersWithProducts = [];

		Customer_orders.find({delivery_id : null}).populate('customer_id')
			.then(function getOrders(orders){

				async.each(orders, function(order, cb){

					Customer_order_products.find({order_id : order.id}).populate('sku_id')
						.then(function getProducts(products){
							order.productslist = products;
							ordersWithProducts.push(order);
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
				return SkuService.getProductName(product.sku_id.id)
					.then(function (brand_name){
						product.sku_id.brand_name = brand_name;
						orderList.push(product);
					})
			})

			.then(function (){
				return res.send(orderList);
			})
	}
};

