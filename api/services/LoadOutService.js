var Promise = require("bluebird");

module.exports = {
	getDeliveries : function (id){
		return new Promise(function (resolve, reject){
			Delivery_transactions.find({loadout_id : id}).populate("customer_id")
				.then(function (transactions){
					resolve(transactions);
				})
		});
	}
}