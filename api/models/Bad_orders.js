/**
* Bad_orders.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	expense : {
  		type : "float",
  		required : true
  	},
  	date : {
  		type : "date",
  		required : true
  	},
  	status : {
  		type : "string",
  		required : true
  	}
  }
};

