/**
 * Delivery_transactionsController
 *
 * @description :: Server-side logic for managing delivery_transactions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require('bluebird');
var moment = require('moment');

module.exports = {
	remove : function (req, res){

		var deliveryId = req.body.delivery;
		var loadout = req.body.loadout;
		var order = req.body.order;

		Delivery_transactions.destroy({id : deliveryId})
			.then(function (){
				return Customer_orders.findOne({id : order.order_id}).populate("customer_id");
			})

			.then(function (customerOrder){
				return CustomerOrderService.getOrderProducts(customerOrder);		
			})

			.then(function (detailedOrder){
				return new Promise(function (resolve){
					Load_out.findOne({id : loadout}).then(function (foundLoadout){
						return foundLoadout;	
					})

					.then(function (foundLoadout){
						return LoadOutService.getDetails(foundLoadout);
					})

					.then(function (detailedLoadout){
						sails.sockets.blast("loadout", {verb : "destroyed", data : {order : detailedOrder, delivery_id : deliveryId, loadout_id : detailedLoadout}});
						resolve(detailedOrder);
					})
				});
			})

			.then(function (detailedOrder){
				return LoadOutService.removeWeight(loadout, detailedOrder.productslist);
			})

			.then(function (){
				return LoadOutService.countTransactions(loadout);				
			})

			.then(function (){
				return Customer_orders.update({id : order.order_id}, {status : "Pending"});
			})

			.then(function (updateCustomerOrder){
				Customer_orders.findOne({id : updatedCustomerOrder[0].id}).populateAll()
					.then(function (detailedOrder){
						sails.sockets.blast('customer_orders', {verb : "updated", data : detailedOrder});
						return res.send("Delivery removed from " + loadout, 200);
					})
			})
	},

	getTransactionDetails : function(req, res){
		var transactionId = req.query.id;
		var transactionList = [];

		Delivery_products.find({dtrans_id : transactionId}).populate("sku_id")
			.then(function (products){
				return products;
			})

			.each(function (product){
				return SkuService.getProductName(product.sku_id.id)
					.then(function (brand_name){
						product.sku_id.brand_name = brand_name;
						transactionList.push(product);
					})
			})

			.then(function (){
				return res.send(transactionList);
			})
	},

	payments : function (req, res){
		var deliveryId = req.body.delivery_id;
		var paidAmount = req.body.paid_amount;
		var paymentDate = req.body.payment_date;
		var user = req.body.user;

		Delivery_transactions.findOne({id : deliveryId})
			.then(function (transaction){
				return new Promise(function (resolve){
					transaction.paid_amount = transaction.paid_amount + paidAmount;

					if(transaction.paid_amount == transaction.total_amount){
						Customer_orders.update({delivery_id : deliveryId}, {status : "Complete"})
							.then(function (updatedOrder){
								transaction.payment_date = paymentDate;
							})

							.then(function (){
								transaction.save(function (err, result){
									sails.sockets.blast("delivery_transactions", {verb : "paid", data : result});
									resolve(transaction.customer_id);
								});
							})
					}

					transaction.save(function (err, result){
						return PaymentsService.getDetails(result).then(function (detailed){
							result = detailed;
							sails.sockets.blast("delivery_transactions", {verb : "paid", data : result});
							resolve(transaction.customer_id);
						});
						
					});

				});
				
			})

			.then(function (customerId){
				var paymentDetails = {
					customer_id  : customerId,
					delivery_id : deliveryId,
					amount : paidAmount,
					date : paymentDate,
					user : user
				};

				Payments.create(paymentDetails).then(function (createdPayment){
					return res.send("Payment successful", 200);
				});
			})
	},

	empties : function (req, res){
		var returns = req.body.returns;
		var deposit = req.body.deposit;
		var deliveryId = req.body.deliveryId;

		if(!deposit){
			deposit = 0;
		}

		if(!Array.isArray(returns)){
			returns = [returns];
		}

		ReturnsService.createReturns(returns, deposit)
			.then(function (returnId){
				return new Promise(function (resolve){
					ReturnsService.getReturnsAmount(returnId, deposit)
						.then(function (returnsAmount){
							return [returnsAmount, Delivery_transactions.findOne({id : deliveryId})];
						})

						.spread(function (returnsAmount, foundDelivery){
							var newAmount = foundDelivery.total_amount - returnsAmount;
							resolve(Delivery_transactions.update({id : deliveryId}, {returns_id : returnId, total_amount : newAmount}));
						})
					
				})
			})

			.then(function (updatedDelivery){
				Delivery_transactions.findOne({id : updatedDelivery[0].id}).populateAll()
					.then(function (delivery){
						return PaymentsService.getDetails(delivery);
					})

					.then(function (detailedDelivery){
						sails.sockets.blast('delivery_transactions', {verb : "for-payment", data : detailedDelivery});
						return res.send("Empties successfully added", 200);
					})		
			})
	},

	list : function (req, res){
		var loadoutId = req.query.loadout;
		var deliveryId = req.query.id;
		var deliveryList = [];

		var findDelivery = {
			loadout_id : loadoutId
		};

		if(deliveryId){
			findDelivery = {
				id : deliveryId
			}
		}

		Delivery_transactions.find(findDelivery).populate('products').populate('customer_id')
			.then(function (deliveries){
				return deliveries;
			})

			.each(function (delivery){
				return new Promise(function (resolve){
					new Promise(function (resolve){
						resolve(delivery.products);
					})

					.each(function (product){
						return new Promise(function (resolve){
							SkuService.getSkuDetails(product.sku_id)
								.then(function (detailedProduct){
									product.sku_id = detailedProduct;
									resolve();
								})
						});
						
					})

					.then(function (){
						deliveryList.push(delivery);
						resolve();
					})
				});
			})

			.then(function (){
				return res.send(deliveryList, 200);
			})
	},

	availableForPayment : function (req, res){
		var date = req.query.date;

		if(!date){
			date = moment().format('YYYY-MM-DD');
		}

		Delivery_transactions.find({delivery_date : date, returns_id : {'not' : null}}).populateAll()
			.then(function (foundDeliveries){
				return foundDeliveries;
			})

			.each(function (delivery){
				return PaymentsService.getDetails(delivery).then(function (detailed){
					delivery = detailed;
				});
			})

			.then(function (foundDeliveries){
				return res.send(foundDeliveries);
			})
	}
};

