/**
* Bad_orders.js
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
      columnName: 'bad_order_id'
    },
  	expense : {
  		type : 'float',
  		required : true
  	},
  	date : {
  		type : 'string',
  		required : true
  	},
    accountable : {
      type : 'string',
      required : true
    },
    products : {
      collection : 'bad_order_details',
      via : 'bad_order_id'
    }
  },

  afterUpdate : function(bad_order, next){
    sails.sockets.blast('bad_orders', {verb : 'destroyed', data : bad_order});
    next();
  },

  afterDestroy : function(bad_order, next){
    sails.sockets.blast('bad_orders', {verb : 'destroyed', data : bad_order});
    next();
  }
};

