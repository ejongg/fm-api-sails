/**
* Purchases.js
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
      columnName: 'purchase_id'
    },
  	date_received : {
  		type : 'string',
  		required : true
  	},
  	total_amount : {
  		type : 'float',
  		required : true,
      defaultsTo : 0.00
  	},
    status : {
      type : 'string',
      defaultsTo : 'Not verified'
    },
    user : {
      type : 'string',
      required : true
    },
    products : {
      collection : 'purchase_products',
      via : 'purchase_id'
    }
  },

  afterUpdate : function(purchase, next){
    sails.sockets.blast('purchases', {verb : 'updated', data : purchase});
  },

  afterDestroy : function(purchase, next){
    sails.sockets.blast('purchases', {verb : 'destroyed', data : purchase});
  }
};

