/**
* Products.js
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
      columnName: 'prod_id'
    },
  	brand_name : {
  		type : 'string',
  		required : true,
  		unique : true
  	},
  	company : {
  		type : 'string',
  		required : true
  	},
    sku : {
      collection : 'sku',
      via : 'prod_id'
    }
  },

  afterCreate : function(product, next){
    sails.sockets.blast('products', {verb : 'created', data : product});
  },

  afterUpdate : function(product, next){
    sails.sockets.blast('products', {verb : 'updated', data : product});
  },

  afterDestroy : function(product, next){
    sails.sockets.blast('products', {verb : 'destroyed', data : product});
  }
};

