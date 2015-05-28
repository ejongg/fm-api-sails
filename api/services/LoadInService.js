var Promise = require('bluebird');
var moment = require('moment');

module.exports = {
	createLoadin : function (loadinNo, loadoutId, customerId, products){
		return new Promise(function (resolve){
			var loadin = {
				date_received : moment().format('YYYY-MM-DD'),
				loadin_number : loadinNo,
				loadout_id : loadoutId,
				customer_id : customerId
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
	}
};