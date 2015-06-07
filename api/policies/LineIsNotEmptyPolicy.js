var Promise = require('bluebird');

module.exports = function(req, res, next){
	var bayId = req.body.id;
	var skuId = req.body.sku;
	var bayLimit = req.body.bay_limit;

	Bays.findOne({id : bayId})
		.then(function (foundBay){		
			return [BaysService.countBayItems(bayId), foundBay];
		})

		.spread(function (bayItemCount, foundBay){
			if((bayItemCount > 0 && foundBay.bay_limit != bayLimit) || (bayItemCount > 0 && foundBay.sku_id != skuId)){
				return res.send({message : "Can't change Bay Limit or Sku. The line is not empty"}, 400);
			}else{
				next();
			}
		})
};