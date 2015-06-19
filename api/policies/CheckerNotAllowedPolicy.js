var Promise = require('bluebird');

module.exports = function (req, res, next){
	var username = req.body.username;

	Users.findOne({username : username})
		.then(function (foundUser){
			
			if(foundUser.type == 'checker'){
				return res.send({message : "User not found"}, 400);
			}else{
				next();
			}
		})
};