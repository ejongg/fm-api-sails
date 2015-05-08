var Promise = require('bluebird');

module.exports = function (req, res, next){
	var products = req.body.products;
	var notAvailable = [];

	function getProducts () {
		return new Promise(function (resolve, reject){
			resolve(products);
		});
	};

	getProducts()
		.each(function (product){
			return new Promise(function (resolve, reject){
				if(product.empty_bottles > 0){
					EmptiesService.countEmptyBottles(product.sku_id)
						.then(function (totalBottles){
							if(product.empty_bottles > totalBottles){
								notAvailable.push(product.name);
								resolve();
							}else{
								resolve();
							}
						})
				}else{
					resolve();
				}
			});
		})

		.then(function (){
			if(notAvailable.length > 0){
				return res.json({code : 0, message : 'Insufficient bottles in Empties Inventory', data : notAvailable});
			}else{
				next();
			}
		})
};