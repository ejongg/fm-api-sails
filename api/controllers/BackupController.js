/**
 * BackupController
 *
 * @description :: Server-side logic for managing backups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var MysqlTools= require('mysql-tools');
 var moment = require('moment');
 var Promise = require('bluebird'); 

module.exports = {
	backup : function (req, res){
		var dumpPath = process.cwd() + '\\backup';
		var date = moment().format('YYYY-MM-DD h:mm:ss a');
		
		var tool = new MysqlTools();

		 tool.dumpDatabase({
		    host: 'localhost'
		    , user: 'root'
		    , password: ''
		    , dumpPath: dumpPath
		    , database: 'fm_marketing'

		}, function (error, output, message, dumpFileName) {
		    if (error instanceof Error) {
		       return res.send({message : error}, 400);

		    } else {

		       Backup.create({date : date, name : dumpFileName})
		       		.then(function (created){
		       			return res.send("Backup created", 200);
		       		})
		    }
		});
	},

	restore : function (req, res){
		var backupId = req.query.id;

		if(!backupId){
			return res.send({message : "An error has occured"}, 400);
		}

		Backup.findOne({id : backupId})
			.then(function (backupFile){
				
				var tool = new MysqlTools();
				 tool.restoreDatabase({
				    host: 'localhost'
				    , user: 'root'
				    , password: ''
				    , sqlFilePath: backupFile.name
				    , database: 'fm_marketing'
				}, function (error, output, message) {
				    if (error instanceof Error) {
				       return res.send({message : error}, 400);
				    } else {
				       return res.send("Data restored successfully", 200);
				    }
				});

			})
	},

	getAll : function (req, res){
		Backup.find().then(function (backups){
			return backups;
		})

		.each(function (backup){
			delete backup.name;
		})

		.then(function (backups){
			return res.send(backups);
		})
	}
};

