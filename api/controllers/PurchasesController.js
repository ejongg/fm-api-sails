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
		var totalAmount = req.body.total_amount;
		var user = req.body.user;

		var purchase = {
			total_amount : totalAmount,
			user : user,
			date_received : moment().format('YYYY-MM-DD')
		};
		
		Purchases.create(purchase)
			.then(function(newPurchase){

				(products).forEach(function(prod){
					
					var productToBeCreated = {
						purchase_id : newPurchase.id,
						sku_id : prod.sku_id,
						cases : prod.cases,
						costpercase : prod.costpercase,
						discountpercase : prod.discountpercase,
						amount : prod.amount
					};

					Purchase_products.create(productToBeCreated)
						.exec(function(err, newProduct){
							if(err)
								console.log(err);														
						});

					var bottlespercase = 0;

					async.series([
						function getBottlesPerCase(cb){
							Sku.findOne({id : prod.sku_id})
								.exec(function(err, sku){
									bottlespercase = sku.bottlespercase;

									cb();
								});						
						},

						function updateInventory(cb){

							InventoryService.put(prod.sku_id, prod.cases, bottlespercase, prod.bay_id, prod.prod_date, prod.lifespan);

							cb();
						}
					]);

				});

				
				return newPurchase;				
			},

			function(err){
				console.log(err);
			})

			.then(function(purchase){
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

