
var moment = require('moment');
var Promise = require("bluebird");

module.exports = {
	removeLoadout : function(delivery){
		return new Promise(function (resolve, reject){
			delivery.loadout_id = null;

			delivery.save(function(err, updatedDelivery){
				if(err) reject(err);

				resolve(updatedDelivery);
			});
		});
	}
};