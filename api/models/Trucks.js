/**
* Trucks.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    id: {
      type: 'integer',
      unique: true,
      primaryKey: true,
      autoIncrement : true,
      columnName: 'truck_id'
    },
  	driver : {
  		type : 'string',
  		required : true
  	},
  	dispatcher : {
  		type : 'string',
  		required : true
  	},
  	agent : {
  		type : 'string',
  		required : true
  	},
  	helper : {
  		type : 'string',
  		required : true
  	},
  	route : {
  		type : 'string',
  		required : true
  	}
  },

  afterCreate : function(truck, next){
    Trucks.publishCreate(truck);
  },

  afterUpdate : function(truck, next){
    Trucks.publishUpdate(truck.id, truck);
  },

  afterDestroy : function(truck, next){
    sails.sockets.blast('trucks', {verb : 'destroyed', data : truck[0].id});
  }
};

