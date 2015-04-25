/**
 * Load_inController
 *
 * @description :: Server-side logic for managing load_ins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var moment = require('moment');
var Promise = require('bluebird');

module.exports = {
	
	add : function(req, res){
		var products = req.body.products;

		var loadin = {
			date_received : moment().format('YYYY-MM-DD'),
			loadin_number : req.body.loadin_no,
			loadout_id : req.body.loadout
		};

		Load_in.create(loadin)
			.then(function createLoadInProducts(createdLoadIn){
				
				_(products).forEach(function(product){
					var loadInProduct = {
						sku_id : product.sku_id,
						cases : product.cases,
						loadin_id : createdLoadIn.id
					};

					Loadin_products.create(loadInProduct)
						.then(function(createdLoadInProduct){
							if(product.sku_id.brand_name === "Coca-cola"){
								return InventoryService.put(product.id, product.cases, product.bottlespercase, product.bay_id, product.prod_date, product.lifespan);
							}else{
								return InventoryService.SMB_put(product.id, product.cases, product.bottlespercase, product.bay_id, product.prod_date, product.lifespan);
							}
						})

						.then(function (){
							return res.send(200);
						})
				});
			});
	}
};

