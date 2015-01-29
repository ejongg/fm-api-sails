/**
 * UsersController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	login : function(req, res){
		var bcrypt = require('bcrypt-nodejs');

		Users.findOneByUsername(req.body.username)
			.exec(function(err, user){
				if(err)
					return res.json({message: 'DB error'}, 500);			

				if(user){
					bcrypt.compare(req.body.password, user.password, function(err, match){
						if(err)
							return res.json({message : 'Server error'}, 500);

						if(match){
							req.session.users = user.id;
							return res.json(user);
						}else
							return res.json({message : 'Password do not match'}, 400);
					});
				}else{
					return res.json({message: 'User not found'}, 404);
				}
			});
	},

	logout : function(req, res){
		Users.findOneByUsername(req.body.id)
			.exec(function(err, user){
				if(err)
					return res.json({message : 'DB error'}, 500);

				if(user){
					user.token = '';
					return res.json({message : 'logout succesful'});
				}else{
					return res.json({message : 'User not found'}, 404);
				}
			});
	}
};

