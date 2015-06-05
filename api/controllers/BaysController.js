/**
 * BayController
 *
 * @description :: Server-side logic for managing bays
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

 var Promise = require('bluebird');

module.exports = {
	add : function(req, res){
		
		var bay = {
			bay_name : req.body.bay_name,
			bay_label : req.body.bay_label,
			bay_limit : req.body.bay_limit,
			sku_id : req.body.sku
		}

		Bays.create(bay)
			.then(function(created_bay){
				return created_bay;
			})

			.then(function (bay){
				
				BaysService.countBayItems(bay.id)
					.then(function (count){
						bay.total_products = count;
						sails.sockets.blast('bays', {verb : 'created', data : bay});
						return res.send(201);
					})
			})

			.catch(function (err){
				return res.send(err, 400);
			})
	},

	edit : function(req, res){
		var bayId = req.body.id;

		var bay = {
			bay_name : req.body.bay_name,
			bay_label : req.body.bay_label,
			bay_limit : req.body.bay_limit,
			pile_status : req.body.pile_status
		};

		Bays.update({id : bayId}, bay)
			.then(function (updatedBay){
				return updatedBay;				
			})

			.then(function (updatedBay){
				return BaysService.countBayItems(updatedBay[0].id).then(function (count){
					updatedBay[0].total_products = count;
					sails.sockets.blast('bays', {verb : 'updated', data : updatedBay[0]});
					return res.send(200);
				});
			})
	},

	list : function (req, res){
		var baysList = []; 

		Bays.find().populate('sku_id')
			.then(function (bays){
				return bays;
			})

			.each(function (bay){
				return new Promise(function (resolve){
						BaysService.countBayItems(bay.id).then(function (count){
						 	bay.total_products = count;
					 	})

					 	.then(function (){
					 		return SkuService.getSkuCompleteName(bay.sku_id.id);
					 	})

					 	.then(function (completeSkuName){
					 		bay.sku_id.sku_name = completeSkuName;
					 	})

					 	.then(function (){
					 		return SkuService.getCompanyName(bay.sku_id.id);
					 	})

					 	.then(function (skuCompany){
					 		bay.sku_id.company = skuCompany;
					 		baysList.push(bay);
					 		resolve();
					 	})
				});
			})

			.then(function (){
				res.send(baysList);
			})
	},

	listNotEmpty : function(req, res){
		var baysList = [];

		Bays.find()
			.then(function (bays){
				return bays;
			})

			.each(function (bay){
				return BaysService.countBayItems(bay.id).then(function (count){
				 	if(count > 0){
				 		bay.total_products = count;
				 		baysList.push(bay);
				 	}
				 })
			})

			.then(function (){
				res.send(baysList);
			})
	},

	listSkuLines : function(req, res){
		var skuId = req.query.id;

		Bays.find({sku_id : skuId})
			.then(function (bays){
				return bays;
			})

			.each(function (bay){
				return BaysService.countBayItems(bay.id).then(function (bayItemCount){
					bay.total_products = bayItemCount;	
				})
			})

			.then(function (bays){
				return res.send(bays);
			})
	},

	changeLineProduct : function(req, res){
		var bayId = req.body.bay;
		var skuId = req.body.sku;
		var skuName = '';

		return SkuService.getSkuCompleteName(skuId)
			.then(function (completeSkuName){
				skuName = completeSkuName;
			})

		Bays.update({id : bayId}, {sku_id : skuId})
			.then(function (updatedBay){
				sails.sockets.blast('bays', {verb : 'updated', data : updatedBay});
				return res.send({message : 'Line Product changed successfully'}, 200);
			})
	}
};

