var Promise = require('bluebird');

module.exports = function (req, res, next){
	var skuId = req.body.sku;
	var status = req.body.pile_status;

	if(status == "Moving pile"){
		Bays.findOne({sku_id : skuId, pile_status : "Moving pile"})
			.then(function (foundBay){

				if(foundBay){
					return res.send({message : "Only one moving pile per sku is allowed"}, 400);
				}else{
					next();
				}
			})
	}else{
		next();
	}
	
};