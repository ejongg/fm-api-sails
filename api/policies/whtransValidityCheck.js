module.exports = function(req, res, next){
	var products = req.body.products;
	var notAvailableProducts = [];
	
	/**
	*	Iterate on each products checking if
	*	the inventory can accomodate the requested
	*	number of products
	*/
	async.each(products, function(product, cb){
		Inventory.find({sku_id : product.sku_id})
			.exec(function(err, found_sku){
				if(found_sku){
					var sku_total_case_count = 0;

					/**
					*	Find all instances of sku adding them all
					*	together
					*/
					_(found_sku).forEach(function(sku){
						sku_total_case_count = sku_total_case_count + sku.physical_count;
					}).value();

					/**
					*	Check if the number of request product is greater than the total
					*	count of the product in the inventory. If yes add that product to 
					*	the array notAvailableProducts
					*/
					if(product.cases > sku_total_case_count){
						notAvailableProducts.push(product.sku_name);
						cb();
					}else{
						cb();
					}

				/**
				* If the product is not found in the inventory send an error message.
				*/
				}else{
					return res.json({code : 0, message : product.sku_name + ' not found in inventory'});
					cb();
				}
			});

	}, function(err){
		if(err)
			console.log(err);

		/**
		*	Check if there are products in the array notAvailableProducts.
		*	If there is do not proceed with the transaction but if everything
		*	is ok then proceed with the transaction
		*/
		if(notAvailableProducts.length == 0){
			if(products.length == 0){
				res.json({code : 0, message : 'Invalid! No products sent.'});
			}else{
				req.result = true;
			}
		}else{
			return res.json({code : 0, message : 'Insufficient stocks in warehouse', data : notAvailableProducts});
		}

		next();
	});
}