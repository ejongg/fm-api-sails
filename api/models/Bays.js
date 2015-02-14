/**
* Bay.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	pile_name : {
  		type : 'string',
  		required : true
  	},
  	products : {
  		collection : 'inventory',
  		via : 'bay_id'
  	}
  },

  afterCreate : function(bay, next){
    Bay.publishCreate(bay);
  },

  afterUpdate : function(bay, next){
    Bay.publishUpdate(bay.id, bay);
  },

  afterDestroy : function(bay, next){
    sails.sockets.blast('bays', {verb : 'destroyed', data : bay[0].id});
  }
};

