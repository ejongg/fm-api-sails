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
    total_amount : {
      type : 'float',
      required : true
    },
  	user : {
  		type : 'string',
  		required : true
  	}
  },

  afterUpdate : function(warehouse_transaction, next){
    Warehouse_transactions.publishUpdate(warehouse_transaction.id, warehouse_transaction);
  },

  afterDestroy : function(warehouse_transaction, next){
    sails.sockets.blast('warehouse_transactions', {verb : 'destroyed', data : warehouse_transaction});;
  }
};

