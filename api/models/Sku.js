/**
* Product_details.js
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
      columnName: 'sku_id'
    },
    sku_name : {
      type : 'string',
      required :  true,
    },
  	prod_id : {
      model : 'products',
      required : true
  	},
  	bottlespercase : {
  		type : 'integer',
  		required : true
  	},
  	size : {
  		type : 'string',
  		required : true
  	},
  	price : {
  		type : 'float',
  		required : true
  	}
  },

  afterCreate : function(sku, next){
    Sku.find({id : sku.id}).populate('prod_id')
      .exec(function(err, populated){
        sails.sockets.blast('sku', {verb : "created", data : populated[0]});  
      });
  },

  afterUpdate : function(sku, next){
    Sku.find({id : sku.id}).populate('prod_id')
      .exec(function(err, populated){
        sails.sockets.blast('sku', {verb : "updated", data : populated[0]});  
      });
  },

  afterDestroy : function(sku, next){
    sails.sockets.blast('sku', {verb : 'destroyed', data : sku[0].id});
  }
};

