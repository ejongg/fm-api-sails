/**
* Warehouse_transactions.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	prod_id : {
      model : 'products',
      required : true
  	},
  	cases : {
  		type : 'integer',
  		required : true
  	},
  	bottles : {
  		type : 'integer',
  		required : true
  	},
  	customer_name : {
  		type : 'string',
  		required : true
  	},
  	date : {
  		type : 'date',
  		required : true
  	},
  	return_id : {
  		model : 'returns',
      required : true
  	},
    products : {
      collection : 'warehouse_prods',
      via : 'wtrans_id'
    }
  },

  afterCreate : function(warehouse_transaction, next){
    Warehouse_transactions.publishCreate(warehouse_transaction);
  },

  afterUpdate : function(warehouse_transaction, next){
    Warehouse_transactions.publishUpdate(warehouse_transaction.id, warehouse_transaction);
  },

  afterDestroy : function(warehouse, next){
    sails.sockets.blast('Warehouse_transactions', {verb : 'destroyed', data : warehouse[0].id});
  }
};

