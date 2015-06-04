/**
 * EmptiesController
 *
 * @description :: Server-side logic for managing empties
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	list : function(req, res){
		Empties.find().populate('sku_id')
			.then(function (foundEmpties){
				return foundEmpties;
			})

			.each(function (record){
				return SkuService.getSkuCompleteName(record.sku_id.id)
					.then(function (completeSkuName){
						record.sku_id.sku_name = completeSkuName;
					})

					.then(function (){
						return SkuService.getCompanyName(record.sku_id.id);
					})

					.then(function (skuCompany){
						record.sku_id.company = skuCompany;
					})
			})

			.then(function (foundEmpties){
				return res.send(foundEmpties, 200);
			})
	}
};

