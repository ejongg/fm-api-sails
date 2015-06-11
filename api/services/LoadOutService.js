var Promise = require("bluebird");

module.exports = {
	getDetails : function (loadout){
		return new Promise(function (resolve){
			var total_amount = 0;

			Delivery_transactions.find({loadout_id : loadout.id}).populate('customer_id')
				.then(function (transactions){
					loadout.transactions = transactions;
					return transactions;
				})

				.each(function (transaction){
					total_amount = total_amount + transaction.total_amount;		
				})

				.then(function (){
					loadout.total_amount = total_amount;
				})

				.then(function (){
					resolve(loadout);
				})
		});
	},

	deductInInventory : function (product){
		return new Promise(function (resolve ,reject){

			SkuService.getCompanyName(product.sku_id.id)
				.then(function (company){
					return company;
				})

				.then(function (company){
					if(company == "SMB"){
						return InventoryService.deduct(product.sku_id.id, product.bottles, product.cases, product.sku_id.bottlespercase);
					}
				})

				.then(function (){
					resolve();
				})
		});
	},

	countTransactions : function (loadoutId){
		return new Promise(function (resolve){

			Delivery_transactions.find({loadout_id : loadoutId})
				.then(function (transactions){

					if(transactions.length == 0){

						return Load_out.destroy({id : loadoutId});
						resolve();

					}else{
						resolve();
					}

				})
		});		
	}
}