var Promise = require('bluebird');

module.exports = function (req, res, next){
	var products = req.body.products;
	var unavailableLines = [];

	new Promise(function (resolve){
		resolve(products);
	})

	.each(function (product){
		return BaysService.checkLineAvailable(product.bay, product.cases)
			.then(function (available){
				if(available == false){
					unavailableLines.push(product.bay);
				}
			})
	})

	.then(function (){
		if(unavailableLines.length > 0){
			return res.send("Some lines are unavailable : " + unavailableLines, 400);
		}else{
			next();
		}
	})
};