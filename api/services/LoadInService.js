var Promise = require('bluebird');
var moment = require('moment');

module.exports = {
	createLoadin : function (loadinNo, loadoutId, deliveryId, products){
		return new Promise(function (resolve){
			var loadin = {
				date_received : moment().format('YYYY-MM-DD'),
				loadin_number : loadinNo,
				loadout_id : loadoutId,
				delivery_id : deliveryId
			};

			Load_in.create(loadin)
				.then(function (createdLoadIn){

					new Promise(function (resolve){
						resolve(products);
					})

					.each(function (product){
						return LoadInService.createLoadinProduct(product, createdLoadIn.id);
					})

					.then(function (){
						sails.sockets.blast("loadin", {verb : "created", data : createdLoadIn});
						resolve();
					})
				})
		});	
	},

	createLoadinProduct : function (product, loadinId){
		return new Promise(function (resolve){

			var loadInProduct = {
				sku_id : product.sku_id,
				cases : product.cases,
				loadin_id : loadinId
			};

			Loadin_products.create(loadInProduct)
				.then(function (createdLoadInProduct){
					return InventoryService.put(product.sku_id, product.cases, product.bottlespercase, product.bay_id, product.prod_date, product.lifespan);
				})

				.then(function (){
					resolve();
				})

		});
	},

	putInInventory : function (product){
		return new Promise(function (resolve, reject){

			if(product.company == "Coca-Cola"){
				return InventoryService.put(product.sku_id, product.cases, product.bottlespercase, product.bay_id, product.prod_date, product.lifespan)
					.then(function (){
						resolve();
					})

			}else{
				return InventoryService.put(product.sku_id, product.cases, product.bottlespercase, product.bay_id, product.prod_date, product.lifespan)
					.then(function (){
						resolve();
					})
			}
		});
	},

	getLoadinAmount : function (deliveryId){
		return new Promise(function (resolve){
			var totalAmount = 0;

			Load_in.findOne({delivery_id : deliveryId})
				.then(function (foundLoadin){
					if(foundLoadin){
						return Loadin_products.find({loadin_id : foundLoadin.id});
					}else{
						resolve(0);
					}
					
				})

				.each(function (product){
					return new Promise(function (resolve){

						Sku.findOne({id : product.sku_id})
							.then(function findSku(sku){
								return sku;
							})

							.then(function computeAmount(sku){
								totalAmount = totalAmount + (product.cases * sku.pricepercase);						
								resolve();
							})
					});
				})

				.then(function (){
					resolve(totalAmount);
				})
		});
	}
};