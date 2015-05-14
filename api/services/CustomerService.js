
var Promise = require('bluebird');

module.exports = {
	createCustomer : function(customer){
		return new Promise(function (resolve){

			var customerDetails = {
				establishment_name : customer.establishment,
				owner_name : customer.owner,
				address : customer.address,
				distance : customer.distance
			};

			Customers.findOrCreate({establishment_name : customer.establishment}, customerDetails)
				.then(function(resultCustomer){
					resolve(resultCustomer);
				})
		});
	}
};