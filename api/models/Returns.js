/**
* Returns.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	return_date : {
  		type : 'date',
  		required : true
  	},
  	return_items : {
  		collection : 'returns_details',
  		via : 'return_id'
  	}
  }
};

