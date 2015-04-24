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
						.exec(function(err, createdLoadInProduct){
							if(err)
								return res.send(err);
						});
				});
			});
	}
};

