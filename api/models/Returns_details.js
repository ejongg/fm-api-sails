/**
* Returns_details.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	prod_id : {

  	},
  	bottles : {
  		type : 'integer',
  		required : true
  	},
  	cases : {
  		type : 'integer',
  		required : true
  	},
  	deposit : {
  		type : 'float',
  		required : true
  	}
  }
};

