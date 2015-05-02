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

		var loadInId = null;

		Load_in.create(loadin)
			.then(function createLoadInProducts(createdLoadIn){
				loadInId = createdLoadIn.id;
				
				return products;
			})

			.each(function (product){

				var loadInProduct = {
					sku_id : product.sku_id,
					cases : product.cases,
					loadin_id : loadInId
				};

				Loadin_products.create(loadInProduct)
					.then(function(createdLoadInProduct){
						return new Promise(function (resolve, reject){

							SkuService.getCompanyName(product.sku_id)
								.then(function (company){
									return company;
								})

								.then(function (company){
									product.company = company;
									return LoadInService.putInInventory(product);
								})

								.then(function (){
									resolve();
								})
						});
					})

					.then(function (){
						return res.send(200);
					})
			})
	}
};

