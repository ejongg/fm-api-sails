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
		
		var orders = req.body.orders;
		
		var customer  = req.body.customer;
		var amount = req.body.total_amount;
		var supplierAgent = req.body.supplieragent_name;
		var user = req.body.user;

		CustomerService.createCustomer(customer)
			.then(function (resultCustomer){
				sails.sockets.blast('customers',  {verb : "created", data : resultCustomer});
				return CustomerOrderService.createOrder(amount, resultCustomer.id, supplierAgent, user, orders);
			})

			.then(function (createdOrder){
				return Customer_orders.findOne({id : createdOrder.id}).populate('customer_id');
			})

			.then(function (foundCustomerOrder){
				sails.sockets.blast('customer_orders', {verb : "created", data : foundCustomerOrder});
				return res.send("Order recorded", 201);
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

			.then(function (products){
				return CustomerOrderService.getTotalAmount(products);
			})

			.then(function (totalAmount){
				return res.send({orders : orderList, total_amount : totalAmount});
			})
	}
};

