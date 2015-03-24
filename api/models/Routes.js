/**
* Routes.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	id : {
  		type: 'integer',
  		unique: true,
  		primaryKey: true,
  		autoIncrement : true,
  		columnName: 'route_id'
  	},
  	route_name : {
  		type : 'string',
  		required : true,
      unique : true
  	},
  	address_id : {
  		model : 'address',
  		required : true
  	}
  },

  afterCreate : function(route, next){
    sails.sockets.blast('routes', {verb : 'created', data : route});
    next();
  },

  afterUpdate : function(route, next){
    sails.sockets.blast('routes', {verb : 'updated', data : route});
    next();
  },

  afterDestroy : function(route, next){
    sails.sockets.blast('routes', {verb : 'destroyed', data : route});
    next();
  }
};

