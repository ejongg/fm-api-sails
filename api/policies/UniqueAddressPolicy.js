var Promise = require('bluebird');

module.exports = function(req ,res, next){
	var days = req.body.days.toString();
	var addressName = req.body.address_name;

	Address.findOne({address_name : addressName}).then(function (foundAddress){

		if(foundAddress){
			return res.send({message : "Address already exists"}, 400);
		}else{
			next();
		}

	})

};