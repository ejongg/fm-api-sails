/**
* Warehouse_transactions.js
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
      columnName: 'warehouse_trans_id'
    },
  	customer_name : {
  		type : 'string',
  		required : true
  	},
  	date : {
  		type : 'string',
  		required : true
  	},
  	return_id : {
  		model : 'returns',
  		required : true
  	},
  	user : {
  		model : 'users',
  		required : true
  	}
  },

  afterCreate : function(warehouse_transaction, next){
    Warehouse_transactions.publishCreate(warehouse_transaction);
  },

  afterUpdate : function(warehouse_transaction, next){
    Warehouse_transactions.publishUpdate(warehouse_transaction.id, warehouse_transaction);
  },

  afterDestroy : function(warehouse_transaction, next){
    sails.sockets.blast('warehouse_transactions', {verb : 'destroyed', data : warehouse_transaction[0].id});;
  }
};

