/**
 * Delivery_transactionsController
 *
 * @description :: Server-side logic for managing delivery_transactions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require("bluebird");

module.exports = {
	remove : function (req, res){
		var delivery = req.body.delivery;
		var loadout = req.body.loadout;
		var order = req.body.order;

		Delivery_transactions.destroy({id : delivery})
			.then(function (destroyedDelivery){
				return destroyedDelivery;
			})

			.then(function (destroyedDelivery){
				Customer_orders.findOne({id : order.order_id})
					.then(function (foundOrder){
						return new Promise (function (resolve, reject){
							Customer_order_products.find({order_id : foundOrder.id}).populate('sku_id')
								.then(function getProducts(products){
									foundOrder.productslist = products;
									resolve(foundOrder);					
								});	

						});
					})

					.then(function (foundOrder){
						sails.sockets.blast("loadout", {verb : "destroyed", data : {order : foundOrder, delivery_id : delivery}});
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

		Delivery_transactions.findOne({id : deliveryId})
			.then(function (transaction){
				return new Promise(function (resolve, reject){
					transaction.paid_amount = transaction.paid_amount + paidAmount;

					if(transaction.paid_amount == transaction.total_amount){
						transaction.payment_date = paymentDate;
					}

					transaction.save(function (err, result){
						sails.sockets.blast("delivery_transactions", {verb : "paid", data : result});
						return res.send(200);
					});

				});
				
			})
	}
};

