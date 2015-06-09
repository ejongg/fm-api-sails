/**
 * Delivery_transactionsController
 *
 * @description :: Server-side logic for managing delivery_transactions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require("bluebird");

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
				Load_out.findOne({id : loadout}).then(function (foundLoadout){
					return foundLoadout;	
				})

				.then(function (foundLoadout){
					return LoadOutService.getDetails(foundLoadout);
				})

				.then(function (detailedLoadout){
					sails.sockets.blast("loadout", {verb : "destroyed", data : {order : detailedOrder, delivery_id : deliveryId, loadout_id : detailedLoadout}});
				})
				
			})

			.then(function (){
				return LoadOutService.countTransactions(loadout);				
			})

			.then(function (){
				return res.send("Delivery removed from " + loadout, 200);
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

		Delivery_transactions.findOne({id : deliveryId})
			.then(function (transaction){
				return new Promise(function (resolve){
					transaction.paid_amount = transaction.paid_amount + paidAmount;

					if(transaction.paid_amount == transaction.total_amount){
						transaction.payment_date = paymentDate;
					}

					transaction.save(function (err, result){
						sails.sockets.blast("delivery_transactions", {verb : "paid", data : result});
						resolve(transaction.customer_id);
					});

				});
				
			})

			.then(function (customerId){
				var paymentDetails = {
					customer_id  : customerId,
					delivery_id : deliveryId,
					amount : paidAmount,
					date : paymentDate
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

		ReturnsService.createReturns(returns, deposit)
			.then(function (returnId){
				return DeliveryService.assignEmpties(deliveryId, returnId);
			})

			.then(function (updatedDelivery){
				sails.sockets.blast('delivery_transactions', {verb : "updated", data : updatedDelivery});
				return res.send("Empties successfully added")
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
	}
};

