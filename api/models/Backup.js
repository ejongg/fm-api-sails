/**
* Backup.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  connection: 'localDiskDb',

  attributes: {
  	date : {
  		type : 'string',
  		required : true
  	},

  	name : {
  		type : 'string',
  		required : true
  	}
  },

  afterCreate : function(backup, next){
  	delete backup.name;
  	sails.sockets.blast('backup', {verb : "created", data : backup});
  	next();
  }
};

