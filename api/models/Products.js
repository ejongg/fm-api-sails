/**
* Products.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	prod_name : {
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
    Products.publishCreate(product);
  },

  afterUpdate : function(product, next){
    Products.publishUpdate(product.id, product);
  },

  afterDestroy : function(product, next){
    sails.sockets.blast('products', {verb : 'destroyed', data : product[0].id});
  }
};

