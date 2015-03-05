/**
 * PurchasesController
 *
 * @description :: Server-side logic for managing purchases
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var _ = require('lodash');
var moment = require('moment');

module.exports = {
	add : function(req, res){
		var products = req.body.purchases.products;

		var purchase = {
			total_cost : req.body.purchases.total_cost,
			user : req.body.purchases.user,
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
				_(products).forEach(function(prod){
					var productToBeCreated = {
						purchase_id : newPurchase.id,
						sku_id : prod.sku_id,
						cases : prod.cases
					};

					Purchase_products.create(productToBeCreated)
						.exec(function(err, newProduct){

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

							/**
							*	Check if the product already exists in the
							*	inventory. If yes then only update the 
							*	logical count and the physical count.
							*/
							Inventory.findOne({sku_id : item.sku_id, exp_date : item.exp_date})
								.exec(function(err, found){
									if(found){
										var p_count = found.physical_count = found.physical_count + parseInt(prod.cases, 10);
										var l_count = found.logical_count = found.logical_count + parseInt(prod.cases, 10);

										Inventory.update({id : found.id}, {physical_count : p_count, logical_count : l_count})
											.exec(function(err, updated){});
									}else{

										/**
										*	If it doesn't exist create an instance of the proudct
										*	in the inventory.
										*/
										Inventory.create(item)
											.exec(function(err, newItem){});
									}
								});
						});

				}).value();
				
				sails.sockets.blast('purchases', newPurchase);
			});
	},

	test : function(req, res){
		console.log(moment('12-12-2015', 'MM-DD-YYYY').add(7, 'months').format('MM-DD-YYYY'));
	}
};

