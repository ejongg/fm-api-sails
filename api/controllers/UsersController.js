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
					return res.json({status : {code: 0, message: "An error has occured. Please contact your administrator."}});			

				if(user){
					bcrypt.compare(req.body.password, user.password, function(err, match){
						if(err)
							return res.json({status : {code : 0, message : "An error has occured"}});

						if(match){
							return res.json({status : {code : 1, message: "Login successful"} , token : Auth.issueToken(user.id)});
						}else
							return res.json({status : {code : 0, message : "Incorrect password"}});
					});
				}else{
					return res.json({status : {code : 0, message: 'User not found'}});
				}
			});
	},

	mobileLogin : function(req, res){
		Users.findOneByUsername(req.body.username)
			.then(function (user){

				if(user){
					if(user.type == "checker"){
						bcrypt.compare(req.body.password, user.password, function(err, match){
							if(err)
								return res.json({status : {code : 0, message : "An error has occured"}});

							if(match){
								return res.json({status : {code : 1, message: "Login successful"} , token : Auth.issueToken(user.id)});
							}else
								return res.json({status : {code : 0, message : "Incorrect password"}});
						});
					}else{
						return res.send({status : {code : 0, message: 'Unable to login. Must be a checker account'}})
					}
					
				}else{
					return res.send({status : {code : 0, message: 'User not found'}});
				}

			})
	},
	
	changePassword : function(req, res){
		var new_password = req.body.new_password;
		var old_password = req.body.old_password;
		var user_id = req.body.user_id;

		Users.findOne({id : user_id})
			.then(function(user){
				return user;
			})

			.then(function (user){
				bcrypt.compare(old_password, user.password, function(err, match){
					if(err)
						return res.json({status : {code : 0, message : "An error has occured"}});

					if(match){

						bcrypt.genSalt(10, function(err, salt){
							bcrypt.hash(new_password, salt, null, function(err, hashed){
								user.password = hashed;
								user.save(function(err, saved){});

								return res.json({status : {code : 1, message : "Password successfully changed "}}, 200);
							});
						});

					}else{
						return res.json({status : {code : 0, message : "Wrong old password entered"}}, 304);
					}
					
				});
			})
	},

	resetPassword : function (req, res){
		var userId = req.body.user;
		var temp = Math.random().toString(36).slice(10);

		Users.findOne({id : userId})
			.then(function (user){

				if(user){
					bcrypt.genSalt(10, function (err, salt){
						bcrypt.hash(temp, salt, null, function (err, hashed){
							user.password = hashed;
							user.save(function (err, saved){});

							return res.send(temp);
						});
					});
				}else{
					return res.send("User not found");
				}

			})
	}
};

