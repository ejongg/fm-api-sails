var Promise = require('bluebird');

module.exports = {
	putInInventory : function (product){
		return new Promise(function (resolve, reject){

			if(product.company == "Coca-Cola"){
				return InventoryService.put(product.sku_id, product.cases, product.bottlespercase, product.bay_id, product.prod_date, product.lifespan)
					.then(function (){
						resolve();
					})

			}else{
				return InventoryService.SMB_put(product.sku_id, product.cases, product.bottlespercase, product.bay_id, product.prod_date, product.lifespan)
					.then(function (){
						resolve();
					})
			}
		});
	}
};