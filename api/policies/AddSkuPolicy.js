module.exports = function (req, res, next){

	var findSku = {
		prod_id : req.body.prod_id,
		sku_name : req.body.sku_name,
		size : req.body.size

	};

	Sku.findOne(findSku)
		.then(function (foundSku){

			if(foundSku){
				return res.send("Sku already exists", 400);
			}else{
				next();
			}
			
		})
};