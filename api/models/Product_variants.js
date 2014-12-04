/**
* Product_details.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    bottles : {
      type : 'integer',
      required : true
    },
    cases : {
      type : 'integer',
      required : true
    },
    size : {
      type : 'string',
      required : true
    },
    price : {
      type : 'float',
      required : true
    },
    lifespan : {
      type : 'integer',
      required : true
    },
    product : {
      model : 'products',
      required : true
    }
  }
};

