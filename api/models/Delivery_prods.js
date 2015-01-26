/**
* Delivery_prods.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    dtrans_id :{

    },
  	prod_id : {

  	},
  	cases : {
  		type : 'integer',
  		required : true
  	},
  	bottles : {
  		type : 'integer',
  		required : true
  	}
  }
};

