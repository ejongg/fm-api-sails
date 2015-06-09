/**
 * SkuController
 *
 * @description :: Server-side logic for managing sku
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Promise = require("bluebird");

module.exports = {
	available : function(req, res){
		var available = [];

		Inventory.find().populate('sku_id')
			.then(function getAvailableSkus(inventoryItems){
				return inventoryItems; 				
			})

			.each(function (item){
				return new Promise(function (resolve, reject){
					if(item.physical_count > 0 && _.findIndex(available, {id : item.sku_id.id}) == -1){
						
						Sku.findOne({id : item.sku_id.id}).populate('prod_id')
							.then(function (sku){
								available.push(sku);
								resolve();
							})
					}else{
						resolve();
					}
				})
			})

			.then(function (){
				return res.send(available);
			})
	},

	getCompanyProducts : function (req ,res){
		var company = req.query.company;
		var list = [];

		Sku.find().populate('prod_id').then(function (skus){
			return skus;
		})

		.each(function (sku){
			if(sku.prod_id.company == company){
				list.push(sku);
			}
		})

		.then(function (){
			return res.send(list);
		})
	},

	availableSkuWithMovingPile : function(req, res){
		var available = [];

		Inventory.find().populate('sku_id')
			.then(function getAvailableSkus(inventoryItems){
				return inventoryItems; 				
			})

			.each(function (item){
				return new Promise(function (resolve, reject){
					if(item.physical_count > 0 && _.findIndex(available, {id : item.sku_id.id}) == -1){
						
						Sku.findOne({id : item.sku_id.id}).populate('prod_id')
							.then(function (sku){
								return sku;
							})

							.then(function (sku){

								Bays.findOne({sku_id : sku.id, pile_status : "Moving pile"}).then(function (found){
									if(found){
										available.push(sku);
										resolve();	
									}else{
										resolve();
									}
											
								})
								
							})
					}else{
						resolve();
					}
				})
			})

			.then(function (){
				return res.send(available);
			})	
	},

	edit : function (req, res){
		var sku = req.body;

		Sku.findOne({id : sku.id})
			.then(function (oldSku){
				return oldSku;
			})

			.then(function (oldSku){
				return new Promise(function (resolve){
					Sku.update({id : sku.id}, sku)
						.then(function (updatedSku){
							return InventoryService.updateExpirationDate(sku.id, updatedSku[0].lifespan, oldSku.lifespan);
						})

						.then(function (){
							resolve();
						})
				});
			})

			.then(function (){
				Sku.findOne({id : sku.id}).populate("prod_id")
					.then(function (foundSku){
						sails.sockets.blast("sku", {verb : "updated", data : foundSku});
						return res.send(200);
					})
			})
	}
};

