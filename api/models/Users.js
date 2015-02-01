/**
* Users.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var bcrypt = require('bcrypt-nodejs');

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
  		minLength : 6,
      defaultsTo : 'abcdef'
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
  	},
    status : {
      type : 'string',
      defaultsTo : 'active'
    }
  },

  beforeCreate : function(user, next){
		bcrypt.genSalt(10, function(err, salt){
			if(err)
				return next(err);

			bcrypt.hash(user.password, salt, null, function(err, hash){
        if(err)
          return next(err);
        
				user.password = hash;
				next();
			});
		});
	},

  beforeUpdate : function(user, next){
    bcrypt.genSalt(10, function(err, salt){
      if(err)
        return next(err);

      bcrypt.hash(user.password, salt, null, function(err, hash){
        if(err)
          return next(err);

        user.password = hash;
        next();
      });
    });
  }  
};

