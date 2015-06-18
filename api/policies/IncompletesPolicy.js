var Promise = require('bluebird');

module.exports = function (req, res, next){
	var product = req.body.products;

	Incomplete_cases.find({sku_id : product.sku_id})
		.then(function (items){
			return items;
		})

		.reduce(function (runningTotal, item){

			return new Promise(function (resolve){
				resolve(runningTotal + item.bottles);
			});

		}, 0)

		.then(function (totalBottles){
			if(totalBottles < product.cases * product.bottlespercase){
				return res.send({message : "Insufficient bottles in Incomplete line"}, 400)
			}else{
				next();
			}
		})
};