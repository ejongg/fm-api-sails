/**
* Address.js
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
  		columnName: 'address_id'
  	},
  	address_name : {
  		type : 'string',
  		required : true
  	},
  	days : {
  		type : 'string',
  		required : true
  	},
    route_id : {
      model : 'routes'
    }
  },

  afterCreate : function(address, next){
    sails.sockets.blast('address', {verb : 'created', data : address});
    next();
  }
};

