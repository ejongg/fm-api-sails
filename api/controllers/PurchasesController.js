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
				sails.sockets.blast('empties', {verb : 'updated'});
				sails.sockets.blast('inventory', {verb : 'updated'});
				sails.sockets.blast('purchases', {verb : 'created', data : purchase});
				return res.send('Purchases added' ,201);
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
	},

	voidPurchase : function (req, res){
		var purchaseId = req.body.purchase_id;
		var username = req.body.username;

		Purchase_products.find({purchase_id : purchaseId}).populate('sku_id')
			.then(function (products){
				return products;
			})

			.each(function (product){
				return InventoryService.deductSpecificProduct(product.sku_id.id, product.bottles, product.cases, product.sku_id.bottlespercase, product.bay_id, product.prod_date);
			})

			.then(function (){
				return Purchases.update({id : purchaseId}, {status : "Void"});
			})

			.then(function (voidPurchase){
				return new Promise(function (resolve){

					Users.findOne({username : username}).then(function (foundUser){

						var voidDetails = {
							purchase_id : voidPurchase[0].id,
							date : moment().format('YYYY-MM-DD'),
							user : foundUser.firstname + ' ' + foundUser.lastname
						};

						return Void_purchases.create(voidDetails);

					})

					.then(function (){
						resolve();
					})
				});
			})

			.then(function (){
				sails.sockets.blast('inventory', {verb : 'updated'});
				return res.send("Purchase now void", 200);
			})
	},

	listVoidPurchases : function (req, res){
		Purchases.find({status : {'like' : 'Void'}})
			.then(function (foundPurchases){
				return res.send(foundPurchases);
			})
	}
};

