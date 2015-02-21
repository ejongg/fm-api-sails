/**
* Inventory.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
  	bay_id : {
      model : 'bays',
      required : true
  	},
  	sku_id : {
      model : 'products',
      required : true
  	},
  	exp_date : {
  		type : 'string',
  		required : true
  	},
  	age : {
  		type : 'integer',
  		required : true
  	},
    physical_count : {
      type : 'integer',
      required : true
    },
    logical_count : {
      type : 'integer',
      required : true
    }
  },

  afterCreate : function(inventory, next){
    Inventory.publishCreate(inventory);
    next();
  },

  afterUpdate : function(inventory, next){
    Inventory.publishUpdate(inventory.id, inventory);
    next();
  },

  afterDestroy : function(inventory, next){
    sails.sockets.blast('inventory', {verb : 'destroyed', data : inventory[0].id});
    next();
  }
};

