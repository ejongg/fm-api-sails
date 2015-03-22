/**
* Bay.js
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
      columnName: 'bay_id'
    },
  	bay_name : {
  		type : 'string',
  		required : true
  	},
    pile_status : {
      type : 'string',
      defaultsTo : 'Full goods'
    },
    bay_label : {
      type : 'string',
      required : true
    },
  	products : {
  		collection : 'inventory',
  		via : 'bay_id'
  	}
  },

  afterCreate : function(bay, next){
    sails.sockets.blast('bays', {verb : 'created', data : bay});
  },

  afterUpdate : function(bay, next){
    sails.sockets.blast('bays', {verb : 'updated', data : bay});
  },

  afterDestroy : function(bay, next){
    sails.sockets.blast('bays', {verb : 'destroyed', data : bay});
  }
};

