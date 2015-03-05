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
      model : 'sku',
      required : true
  	},
  	exp_date : {
  		type : 'string',
  		required : true
  	},
  	age : {
  		type : 'integer',
      defaultsTo : 0
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
    Inventory.find({id : inventory.id}).populate('sku_id').populate('bay_id')
          .exec(function(err, populated){
            sails.sockets.blast('inventory', {verb : 'created', data : populated[0]});
          });    
  },

  afterUpdate : function(inventory, next){
    Inventory.find({id : inventory.id}).populate('sku_id').populate('bay_id')
          .exec(function(err, populated){
            sails.sockets.blast('inventory', {verb : 'updated', data : populated[0]});
          });
  },

  afterDestroy : function(inventory, next){
    sails.sockets.blast('inventory', {verb : 'destroyed', data : inventory[0].id});
  }
};

