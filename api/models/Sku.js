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
      unique : true
    },
  	prod_id : {
      model : 'products',
      required : true
  	},
  	bottlespercase : {
  		type : 'integer',
  		required : true,
      defaultsTo : 0
  	},
  	size : {
  		type : 'string',
  		required : true
  	},
  	pricepercase : {
  		type : 'float',
  		required : true,
      defaultsTo : 0.00
  	},
    priceperbottle : {
      type : 'float',
      required : true,
      defaultsTo : 0.00
    },
    weightpercase : {
      type : 'float',
      required : true,
      defaultsTo : 0.00
    },
    lifespan : {
      type : 'integer',
      required : true
    }
  },

  afterCreate : function(sku, next){
    Sku.findOne({id : sku.id}).populate('prod_id')
      .exec(function(err, populated){
        sails.sockets.blast('sku', {verb : "created", data : populated});  
        next();
      });
  },

  afterDestroy : function(sku, next){
    sails.sockets.blast('sku', {verb : 'destroyed', data : sku});
    next();
  }
};

