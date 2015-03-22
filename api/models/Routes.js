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
  }
};

