/**
* Load_in.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	id : {
  		type: "integer",
  		unique: true,
  		primaryKey: true,
  		autoIncrement : true,
  		columnName: "loadin_id"
  	},
  	date_received : {
  		type : "string",
  		required : true
  	},
  	status : {
  		type : "string",
  		required : true,
  		defaultsTo : "Not verified"
  	},
  	loadin_number : {
  		type : "int",
  		required : true
  	},
  	loadout_id : {
  		model : "load_out",
  		required : true
  	}
  },

  afterUpdate : function(loadin, next){
    sails.sockets.blast('loadin', {verb : 'updated', data : loadin});
    next();
  },

  afterDestroy : function(loadin, next){
    sails.sockets.blast('loadin', {verb : 'destroyed', data : loadin});
    next();
  }
};

