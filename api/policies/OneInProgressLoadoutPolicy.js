var Promise = require('bluebird');

module.exports = function(req, res, next){
	var truck = req.body.truck_id;
	var deliveryDate = req.body.delivery_date;

	Load_out.findOne({truck_id : truck.id, date_created : deliveryDate, status : "In progress"})
		.then(function (foundLoadout){

			if(foundLoadout){
				return res.send({message : "Please complete the prior loadout first"}, 400);
			}else{
				next();
			}

		})
};