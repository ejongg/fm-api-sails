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
  		required : true
  	},
  	company : {
  		type : 'string',
  		required : true
  	},
    variants : {
      collection : 'product_details',
      via : 'prod_id'
    }
  },

  afterCreate : function(product, next){
    Products.publishCreate({prod_name : product.prod_name, company : product.company, variants : product.variants});
  },

  afterUpdate = function(product, next){
    Products.publishUpdate(product.id, product);
  }
};

