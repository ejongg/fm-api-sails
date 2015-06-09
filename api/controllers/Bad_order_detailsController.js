/**
 * Bad_order_detailsController
 *
 * @description :: Server-side logic for managing bad_order_details
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Promise = require('bluebird');

module.exports = {
	getProducts : function (req, res){
		var badOrderId = req.query.id;

		Bad_order_details.find({bad_order_id : badOrderId}).populate('bad_order_id')
			.then(function (badOrderProducts){
				return badOrderProducts;
			})

			.each(function (product){
				return new Promise(function (resolve){
					SkuService.getSkuDetails(product.sku_id)
						.then(function (details){
							product.sku_id = details;
							resolve();
						})
				});
			})

			.then(function (badOrderProducts){
				return res.send(badOrderProducts);
			})
	}	
};

