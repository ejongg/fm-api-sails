/**
 * UsersController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var bcrypt = require('bcrypt-nodejs');

module.exports = {
	login : function(req, res){
		var rand_token = require('rand-token');

		Users.findOneByUsername(req.body.username)
			.exec(function(err, user){
				if(err)
					return res.json({message: 'DB error'});			

				if(user){
					bcrypt.compare(req.body.password, user.password, function(err, match){
						if(err)
							return res.json({message : 'Server error'});

						if(match){
							var token = rand_token.generate(32);

							Users.update({username : user.username}, {token : token})
								.exec(function(err, updated){
									if(err)
										return res.json({message : 'An error occured'});
								});

							user.token = token;
							return res.json(user);
						}else
							return res.json({message : 'Passwords do not match'});
					});
				}else{
					return res.json({message: 'User not found'});
				}
			});
	},

	logout : function(req, res){
		Users.findOneByUsername(req.body.username)
			.exec(function(err, user){
				if(err)
					return res.json({message : 'DB error'});

				if(user){
					Users.update({username : user.username}, {token : ''})
						.exec(function(err, updated){
							if(err)
								return res.json({message : 'An error occured'});
						});

					return res.json({message : 'logout succesful'});
				}else{
					return res.json({message : 'User not found'});
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

		Users.findOneByUsername(req.body.username)
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

