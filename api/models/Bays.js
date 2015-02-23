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
    Bays.publishCreate(bay);
    next();
  },

  afterUpdate : function(bay, next){
    Bays.publishUpdate(bay.id, bay);
    next();
  },

  afterDestroy : function(bay, next){
    sails.sockets.blast('bays', {verb : 'destroyed', data : bay[0].id});
    next();
  }
};

