/**
 * Bad_ordersController
 *
 * @description :: Server-side logic for managing bad_orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var moment = require('moment');

module.exports = {
	add : function(req, res){
		var products = req.body.products;

		var bad_order = {
			expense : req.body.total_expense,
			accountable : req.body.accountable,
			date : moment().format('YYYY-MM-DD')
		};

		Bad_orders.create(bad_order)
			.exec(function(err, created_bad_order){
				(products).forEach(function(product){

					var item = {
						bad_order_id : 	created_bad_order.id,
						sku_id : product.sku_id,
						cases : product.cases,
						reason : product.reason
					};

					Bad_order_details.create(item)
						.exec(function(err, created_item){
							if(err) 
								console.log(err);
						});

					async.series([
						function deductInInventory(cb){
							InventoryService.deduct(product.sku_id, product.bottles, product.cases, product.bottlespercase)
								.then(function (){
									cb();
								});	
						},

						function emit(cb){
							sails.sockets.blast('bad_orders', {verb : "created", data :created_bad_order});
							return res.send(201);
							cb();
						}
					]);

				});
			});
	},

	getBadOrderProducts : function(req, res){
		var badOrderId = req.query.id;
		var badOrdersList = [];

		Bad_order_details.find({bad_order_id : badOrderId}).populate("sku_id")
			.then(function (products){
				return products;
			})

			.each(function (product){
				return SkuService.getCompany(product.sku_id.id)
					.then(function (company){
						product.sku_id.company = company;
						badOrdersList.push(product);
					})
			})

			.then(function (){
				return res.send(badOrdersList);
			})
	},

	test : function(req, res){
		var sku = 6,
			bottles = 0,
			cases = 100,
			bottlespercase = 24;

		InventoryService.experimentalDeduct(sku, bottles, cases, bottlespercase)
			.then(function (result){
				return res.send(result);
			})

			.catch(function (err){
				console.log(err);
			});
	}
};

