/**
* Load_out.js
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
  		columnName: "loadout_id"
  	},
  	date_created : {
  		type : "string",
  		required : true
  	},
  	status : {
  		type : "string",
  		defaultsTo : "Not verified"
  	},
  	loadout_number : {
  		type : "integer",
  		required : true
  	},
    truck_id : {
      model : "trucks"
    },
    deliveries : {
      collection : "delivery_transactions",
      via : "loadout_id"
    }
  },

  afterUpdate : function(loadout, next){
    sails.sockets.blast('loadout', {verb : 'updated', data : loadout});
    next();
  },

  afterDestroy : function(loadout, next){
    sails.sockets.blast('loadout', {verb : 'destroyed', data : loadout});
    next();
  }
};

