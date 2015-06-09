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
  		required : true
  	},
    company : {
      type : 'string',
      required : true
    },
    coke_address : {
      collection : 'address',
      via : 'coke_route'
    },
    smb_address : {
      collection : 'address',
      via : 'smb_route'
    }
  },

  afterUpdate : function(route, next){
    sails.sockets.blast('routes', {verb : 'updated', data : route});
    next();
  }
};

