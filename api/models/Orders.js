/**
* Orders.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	cokeagent_name : {
  		type : 'string',
  		required : true
  	},
  	prod_id : {
      model : 'products',
      required : true
  	},
  	bottles : {
  		type : 'integer',
  		required : true
  	},
  	cases : {
  		type : 'integer',
  		required : true
  	},
  	date_received : {
  		type : 'date',
  		required : true
  	}
  },

  afterCreate : function(order, next){
    Orders.publishCreate(order);
  },

  afterUpdate : function(order, next){
    Orders.publishUpdate(order.id, order);
  },

  afterDestroy : function(order, next){
    sails.sockets.blast('orders', {verb : 'destroyed', data : order[0].id});
  }
};

