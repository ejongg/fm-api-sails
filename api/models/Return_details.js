/**
* Return_details.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	return_id : {
  		model : 'returns',
  		required : true
  	},
  	sku_id : {
  		model : 'sku',
  		required : true
  	},
  	bottles : {
  		type : 'integer',
  	},
  	cases : {
  		type : 'integer'
  	},
  	deposit : {
  		type : 'float',
  		required : true
  	}
  },

  afterCreate : function(return_detail, next){
    Return_details.publishCreate(return_detail);
  },

  afterUpdate : function(return_detail, next){
    Return_details.publishUpdate(return_detail.id, return_detail);
  },

  afterDestroy : function(return_detail, next){
    sails.sockets.blast('return_details', {verb : 'destroyed', data : return_detail[0].id});
  }
};

