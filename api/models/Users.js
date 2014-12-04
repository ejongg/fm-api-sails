/**
* Users.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	username : {
  		type : "string",
  		required : true,
  		unique : true
  	},
  	password : {
  		type : "string",
  		required : true,
  		minLength : 6
  	},
  	type : {
  		type : "string",
  		required : true
  	},
  	firstname : {
  		type : "string",
  		required : true
  	},
  	lastname : {
  		type : "string",
  		required : true
  	}
  },

  beforeCreate : function(user, next){
		var bcrypt = require('bcrypt-nodejs');

		bcrypt.genSalt(10, function(err, salt){
			if(err)
				return next(err);

			bcrypt.hash(user.password, salt, null, function(err, hash){
				user.password = hash;
				next();
			});
		});
	}
};

