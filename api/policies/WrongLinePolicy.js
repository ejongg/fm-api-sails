var Promise = require('bluebird');

module.exports = function(req, res, next){
	var products = req.body.products;
	var wrongLine = [];

	if(!Array.isArray(products)){
		products = [products];
	}

	console.log(products);

	new Promise(function (resolve){
		resolve(products);
	})

	.each(function (product){
		return new Promise(function (resolve){
			Bays.findOne({id : product.bay})
				.then(function (foundBay){
					if(foundBay.sku_id != product.sku_id){

						SkuService.getSkuCompleteName(foundBay.sku_id)
							.then(function (bayProduct){
								wrongLine.push({bay : foundBay.bay_name, bay_product : bayProduct, wrong_product : product.company + ' ' + product.name});
								resolve();
							})

					}else{
						resolve();
					}

				})
		});
	})

	.then(function (){
		if(wrongLine.length > 0){
			return res.send({message : "You are putting some products in a wrong bay", data : wrongLine}, 400);
		}else{
			next();
		}
	})
};