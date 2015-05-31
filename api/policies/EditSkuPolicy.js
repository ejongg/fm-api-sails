module.exports = function (req, res, next){

	var flag = req.body.flag;

	var findSku = {
		prod_id : req.body.prod_id,
		sku_name : req.body.sku_name,
		size : req.body.size
	};

	if(flag == 1){
		Sku.findOne(findSku)
			.then(function (foundSku){

				if(foundSku){
					return res.send("Sku already exists", 400);
				}else{
					next();
				}
				
			})
			
	}else if(flag == 2){
		next();
	}
	
};