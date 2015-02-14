/**
* Trucks.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	driver_name : {
  		type : 'string',
  		required : true
  	},
  	agent_name : {
  		type : 'string',
  		required : true
  	},
  	helper_name : {
  		type : 'string',
  		required : true
  	},
  	dispatcher_name : {
  		type : 'string',
  		required : true
  	},
  	route : {
		  type : 'string',
  		required : true	
  	},
    deliveries : {
      collection : 'delivery_transactions',
      via : 'truck_id'
    }
  },

  afterCreate : function(truck, next){
    Trucks.publishCreate(truck);
  },

  afterUpdate : function(truck, next){
    Trucks.publishUpdate(truck.id, truck);
  },

  afterDestroy : function(truck, next){
    sails.sockets.blast('truck', {verb : 'destroyed', data : truck[0].id});
  }
};

