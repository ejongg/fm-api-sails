/**
* Trucks.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	driver_name : {
  		type : 'string',
  		required : true
  	},
  	agent_name : {
  		type : 'string',
  		required : true
  	},
  	helper_name : {
  		type : 'string',
  		required : true
  	},
  	dispatcher_name : {
  		type : 'string',
  		required : true
  	},
  	route : {
		  type : 'string',
  		required : true	
  	}
  }
};

