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
  		required : true,
  		unique : true
  	},
  	total_cost : {
  		type : 'string',
  		required : true
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

  afterCreate : function(purchase, next){
    sails.sockets.blast('purchases', {verb : 'created', data : purchase});
  }
};

