var Promise = require('bluebird');

module.exports = function(req ,res, next){
	var addressName = req.body.address_name;
	var days = req.body.days;

	if(addressName == undefined){
		addressName = req.body.address.address_name;
		days = req.body.address.address_name;
	}

	days.toString();

	Address.findOne({address_name : addressName, days : days}).then(function (foundAddress){

		if(foundAddress){
			return res.send({message : "Address already exists"}, 400);
		}else{
			next();
		}

	})

};