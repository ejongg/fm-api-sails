/**
* Products.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	prod_name : {
  		type : 'string',
  		required : true
  	},
  	brand : {
  		type : 'string',
  		required : true
  	}
  }
};

