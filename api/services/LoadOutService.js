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
		return new Promise(function (resolve){

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

						Load_out.destroy({id : loadoutId})
							.then(function (destroyedLoadout){
								resolve();
							})
							
					}else{
						resolve();
					}

				})
		});		
	},

	addWeight : function (loadoutId, products){
		return new Promise(function (resolve){
			new Promise(function (resolve){
				resolve(products);
			})

			.each(function (product){
				return new Promise(function (resolve){

					Load_out.findOne({id : loadoutId})
						.then(function (foundLoadout){
							var weight = foundLoadout.current_weight + (product.sku_id.weightpercase * product.cases);

							return Load_out.update({id : loadoutId}, {current_weight : weight});
						})

						.then(function (){
							resolve();
						})
				});
			})

			.then(function (){
				resolve();
			})
		});
	},

	removeWeight : function (loadoutId, products){
		return new Promise(function (resolve){
			new Promise(function (resolve){
				resolve(products);
			})

			.each(function (product){
				return new Promise(function (resolve){
					
					Load_out.findOne({id : loadoutId})
						.then(function (foundLoadout){
							var weight = foundLoadout.current_weight - (product.sku_id.weightpercase * product.cases);

							return Load_out.update({id : loadoutId}, {current_weight : weight});
						})

						.then(function (){
							resolve();
						})
				});
			})

			.then(function (){
				resolve();
			})
		});
	},

	countOrderWeight : function (products){
		return new Promise(function (resolve){
			var weight = 0;

			new Promise(function (resolve){
				resolve(products);
			})

			.each(function (product){
				weight = weight + product.sku_id.weightpercase * product.cases;
			})

			.then(function (){
				resolve(weight);
			})
		});
	}
}