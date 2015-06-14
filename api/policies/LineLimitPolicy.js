var Promise = require('bluebird');

module.exports = function (req, res, next){
	var products = req.body.products;
	var unavailableLines = [];

	new Promise(function (resolve){
		resolve(products);
	})

	.each(function (product){
		return BaysService.checkLineAvailable(product.bay_id, product.cases)
			.then(function (available){
				if(available == false){
					return Bays.findOne({id : product.bay_id}).then(function (foundBay){
						unavailableLines.push(foundBay.bay_name);
					})					
				}
			})
	})

	.then(function (){
		if(unavailableLines.length > 0){
			return res.send({message : "Some lines can't accomodate more products", data : unavailableLines}, 400);
		}else{
			next();
		}
	})
};