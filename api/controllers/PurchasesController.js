/**
 * PurchasesController
 *
 * @description :: Server-side logic for managing purchases
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');
var Promise = require("bluebird");

module.exports = {
	add : function(req, res){
		var products = req.body.products;

		var purchase = {
			total_amount : req.body.total_amount,
			user : req.body.user,
			date_received : moment().format('YYYY-MM-DD')
		};
		
		Purchases.create(purchase)
			.then(function (newPurchase){
				return new Promise(function (resolve, reject){
					PurchaseService.createProducts(products, newPurchase.id)
						.then(function (){
							resolve(newPurchase);
						})							
				});				
			})

			.then(function (purchase){
				sails.sockets.blast('purchases', {verb : 'created', data : purchase});
				return res.send(201);
			});
	},

	getPurchaseDetails : function (req, res){
		var purchaseId = req.query.id;
		var purchasesList = [];

		Purchase_products.find({purchase_id : purchaseId}).populate("sku_id").populate("purchase_id")
			.then(function (products){
				return products;
			})

			.each(function (product){
				return SkuService.getProductName(product.sku_id.id)
					.then(function (brand_name){
						product.sku_id.brand_name = brand_name;
						purchasesList.push(product);
					})
			})

			.then(function (){
				return res.send(purchasesList);
			})
	}
};

