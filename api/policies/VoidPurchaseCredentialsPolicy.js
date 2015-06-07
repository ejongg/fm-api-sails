var Promise = require('bluebird');
var bcrypt = require('bcrypt-nodejs');

module.exports = function(req, res, next){
	var username = req.body.username;
	var password = req.body.password;

	Users.findOne({username : username}).then(function (foundUser){

		if(foundUser){

			if(foundUser.type != 'admin'){
				return res.send({message : "User not authorized to void purchases"}, 400);
			}

			bcrypt.compare(password, foundUser.password, function(err, match){
				if(err) return res.send({message : "An error has occured"}, 400);

				if(match){
					next();
				}else{
					return res.send({message : "User credentials do no match"}, 400);
				}
			});

		}else{
			return res.send({message : "User not found"}, 400);
		}

	})
};