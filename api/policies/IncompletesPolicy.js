module.exports = function (req, res, next){
	var product = req.body.product;

	Incomplete_cases.findOne({sku_id : product.sku_id, exp_date : product.exp_date})
		.then(function (item){

			bottlesToDeduct = product.cases * product.bottlespercase;

			if(item.bottles < bottlesToDeduct){
				return res.send("Insufficient bottles in Incomplete bay", 400)
			}else{
				next();
			}

		})
};