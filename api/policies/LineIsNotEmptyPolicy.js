var Promise = require('bluebird');

module.exports = function(req, res){
	var bayId = req.body.bay;
	var skuId = req.body.sku;
	var skuName = '';

	Bays.findOne({id : bayId})
		.then(function (foundBay){
			return BaysService.countBayItems(bayId);
		})

		.then(function (bayItemCount){
			if(bayItemCount > 0){
				return res.send({message : "The line is not empty"}, 400);
			}else{
				next();
			}
		})
};