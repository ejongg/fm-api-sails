var Promise = require('bluebird');

module.exports = function(req, res){
	var bayId = req.body.bay;
	var skuId = req.body.sku;
	var skuName = '';

	return SkuService.getSkuCompleteName(skuId)
		.then(function (completeSkuName){
			skuName = completeSkuName;
		})

	Bays.findOne({id : bayId})
		.then(function (foundBay){
			if(foundBay.skuId == skuId){
				return res.send({message : skuName + ' ' + 'is already set for this bay'}, 400);
			}else{
				next();
			}
		})
};