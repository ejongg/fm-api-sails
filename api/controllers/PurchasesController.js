/**
 * PurchasesController
 *
 * @description :: Server-side logic for managing purchases
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var _ = require('lodash');
var moment = require('moment');
var async = require('async');

module.exports = {
	add : function(req, res){
		var products = req.body.products;

		var purchase = {
			total_cost : req.body.total_cost,
			user : req.body.user,
			date_received : moment().format('MM-DD-YYYY')
		};
		
		/**
		*	Create the purchase record
		*/
		Purchases.create(purchase)
			.exec(function(err, newPurchase){

				/**
				*	For each of the products in the products array,
				*	add a purchase_id attribute to each of the objects
				*	then create the purchase_product.
				*/
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

							/**
							*	NOTE: The exp_date attr here is just temporary
							* 	will change it to the proper one when the
							*	lifespan of products is already known.
							*
							*	After creating the purchase and purchase_products
							*	instances, add the products to the inventory.
							*/
							var item = {
								bay_id : prod.bay_id, 
								sku_id : prod.sku_id, 
								exp_date : prod.prod_date, 
								physical_count : prod.cases, 
								logical_count : prod.cases
							};


							async.series([
								function getTotalBottles(cb){
									Sku.findOne({id : prod.sku_id})
										.exec(function(err, found_sku){
											item.bottles = found_sku.bottlespercase * prod.cases;
										});

									cb();
								},

								function updateInventory(cb){
									/**
									*	Check if the product already exists in the
									*	inventory. If yes then only update the 
									*	logical count and the physical count.
									*/
									Inventory.findOne({sku_id : item.sku_id, exp_date : item.exp_date, bay_id : prod.bay_id})
										.exec(function(err, found){
											if(err)
												console.log(err);

											if(found){
												found.physical_count = found.physical_count + parseInt(prod.cases, 10);
												found.logical_count = found.logical_count + parseInt(prod.cases, 10);
												found.bottles = found.bottles + item.bottles;
												found.save(function(err, saved){});

												cb();
											}else{
												Inventory.create(item)
													.exec(function(err, newItem){});

												cb();
											}
										});
								}
							]);
						});
				});

				sails.sockets.blast('purchases', {verb : 'created', data : newPurchase});
				return res.send(201);				
			});
	}
};

