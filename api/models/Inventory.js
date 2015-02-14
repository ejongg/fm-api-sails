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
  	prod_id : {
      model : 'products',
      required : true
  	},
  	bottles : {
  		type : 'integer',
  		required : true
  	},
  	cases : {
		type : 'integer',
  		required : true
  	},
  	exp_date : {
  		type : 'date',
  		required : true
  	},
  	age : {
  		type : 'integer',
  		required : true
  	}
  },

  afterCreate : function(inventory, next){
    Inventory.publishCreate(inventory);
  },

  afterUpdate : function(inventory, next){
    Inventory.publishUpdate(inventory.id, inventory);
  },

  afterDestroy : function(inventory, next){
    sails.sockets.blast('inventory', {verb : 'destroyed', data : inventory[0].id});
  }
};

