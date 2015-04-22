var Promise = require("bluebird");

module.exports = {
	getDetails : function (loadout){
		return new Promise(function (resolve, reject){
			var total_amount = 0;

			Delivery_transactions.find({loadout_id : loadout.id}).populate("customer_id")
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
	}
}