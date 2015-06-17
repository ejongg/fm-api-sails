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

		if(customer){
			CustomerService.createCustomer(customer)
				.then(function (resultCustomer){
					sails.sockets.blast('customers',  {verb : "created", data : resultCustomer});
					return CustomerOrderService.createOrder(amount, resultCustomer.id, supplierAgent, user, orders);
				})

				.then(function (createdOrder){
					return Customer_orders.findOne({id : createdOrder.id}).populate('customer_id');
				})

				.then(function (foundCustomerOrder){
					sails.sockets.blast('inventory', {verb : "updated"});
					sails.sockets.blast('customer_orders', {verb : "created", data : foundCustomerOrder});
					return res.send("Order recorded", 201);
				})	
		}
	},

	list : function(req, res){
		var routeId = req.query.route;
		var company = null;

		var tomorrow = moment().add(1, 'days').format('dddd').toLowerCase();

		if(tomorrow == 'sunday'){
			tomorrow = 'monday';
		}
		
		function getRouteAddress(){
			return new Promise(function (resolve){
				var addressList = [];

				Routes.findOne({id : routeId}).then(function (foundRoute){
					var query = null;
					company = foundRoute.company;

					if(foundRoute.company == 'SMB'){
						query = {smb_route : foundRoute.id, days : {'contains' : tomorrow}};
					}else{
						query = {coke_route : foundRoute.id, days : {'contains' : tomorrow}};
					}

					return Address.find(query);
				})

				.then(function (address){
					return address;
				})

				.each(function (address){
					addressList.push(address.address_name);
				})

				.then(function (){
					resolve(addressList);
				})
			})
		};

		function getDeliveryCompany(orderId){
			return new Promise(function (resolve){
				Customer_order_products.findOne({order_id : orderId})
					.then(function (foundProduct){
						resolve(SkuService.getCompanyName(foundProduct.sku_id));
					})
			});
		};
		
		getRouteAddress().then(function (addressList){
			var ordersList = [];
			var finalList = [];

			Customer_orders.find({delivery_id : null, status : {'like' : 'Pending'}}).populate('customer_id')
				.then(function (orders){
					return orders;
				})

				.each(function (order){
					return new Promise(function (resolve){
						getDeliveryCompany(order.id).then(function (orderCompany){
							
							if(addressList.indexOf(order.customer_id.address) != -1 && orderCompany == company){
								ordersList.push(order);
								resolve();
							}else{
								resolve();
							}

						})
					});
				})

				.then(function (){
					return ordersList;
				})

				.each(function (order){
					var productsList = [];
					return new Promise(function (resolve){

						Customer_order_products.find({order_id : order.id})
							.then(function (products){
								return products;
							})

							.each(function (product){
								return SkuService.getSkuDetails(product.sku_id).then(function (skuDetails){
									product.sku_id = skuDetails;
									productsList.push(product);
								});
							})

							.then(function (){
								order.productslist = productsList;
								finalList.push(order);
								resolve();
							})

					});
				})

				.then(function (){
					return res.send(finalList);
				})
		})
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
				Customer_orders.findOne({id : orderId}).populate('customer_id')
					.then(function (foundOrder){
						return res.send({products : orderList, total_amount : totalAmount, order : foundOrder});
					})
			})
	},

	listCancelledOrders : function (req, res){
		Customer_orders.find({status : {'like' : 'Cancelled'}}).populate('customer_id')
			.then(function (foundOrders){
				return res.send(foundOrders);
			})
	},

	cancelOrder : function (req, res){
		var orderId = req.body.order_id;
		var username = req.body.username;

		Customer_orders.update({id : orderId}, {status : "Cancelled"})
			.then(function (order){
				return new Promise(function (resolve){
					Users.findOne({username : username}).then(function (foundUser){

						var cancelledOrder = {
							order_id : order[0].id,
							date : moment().format('YYYY-MM-DD'),
							user : foundUser.firstname + ' ' + foundUser.lastname
						};


						return Cancelled_orders.create(cancelledOrder);
					})

					.then(function (){
						resolve();
					})
				});
			})

			.then(function (){
				return Customer_order_products.find({order_id : orderId});
			})

			.each(function (product){
				return new Promise(function (resolve){
					SkuService.getCompanyName(product.sku_id).then(function (skuCompany){
						if(skuCompany == 'SMB'){
							
							BaysService.findMovingPile(product.sku_id, function(err, result){
								if(err) return res.send({message : "An error has occured"}, 400);

								if(typeof result == 'number'){

									SkuService.getSkuDetails(product.sku_id).then(function (sku){
										return InventoryService.put(product.sku_id, product.cases, sku.bottlespercase, result, product.prod_date, sku.lifespan);
									})

									.then(function (){
										resolve();
									})
								}

							});

						}else{
							resolve();
						}
						
					});
				});
			})

			.then(function (){
				Customer_orders.findOne({id : orderId}).populate('customer_id').then(function (foundOrder){
					sails.sockets.blast('customer_orders', {verb : 'cancelled', data : foundOrder});
					sails.sockets.blast('inventory', {verb : "updated"});
					return res.send({message : "Order cancelled"}, 200);
				})
			})
	}
};

