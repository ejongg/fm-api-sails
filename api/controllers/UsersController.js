/**
 * UsersController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var bcrypt = require('bcrypt-nodejs');

module.exports = {
	login : function(req, res){
		Users.findOneByUsername(req.body.username)
			.exec(function(err, user){
				if(err)
					return res.json({status : {code: 0, message: "An error has occured"}});			

				if(user){
					bcrypt.compare(req.body.password, user.password, function(err, match){
						if(err)
							return res.json({status : {code : 0, message : "An error has occured"}});

						if(match){
							return res.json({status : {code : 1, message: "Login successful"} , token : Auth.issueToken(user)});
						}else
							return res.json({status : {code : 0, message : "Incorrect password"}});
					});
				}else{
					return res.json({status : {code : 0, message: 'User not found'}});
				}
			});
	},
	
	changepassword : function(req, res){
		var password = req.body.password;

		bcrypt.genSalt(10, function(err, salt){
			if(err)
				return res.json({message : 'An error occured'});

			bcrypt.hash(password, salt, null, function(err, hash){
				password = hash;
			});
		});

		Users.findOneByUsername(req.token)
			.exec(function(err, user){
				if(err)
					return res.json({message : 'An error occured'});

				if(user){
					Users.update({username : user.username}, {password : password})
						.exec(function(err, updated){
							if(err)
								return res.json({message : 'An error occured'});
						});

					user.password = password;
					return res.json(user);
				}else{
					return res.json({message : 'User not found'});
				}
			});
	}
};

