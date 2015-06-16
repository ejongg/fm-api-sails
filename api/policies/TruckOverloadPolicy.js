var Promise = require('bluebird');
var moment = require('moment');

module.exports = function(req, res, next){
	var orders = req.body.orders;	
	var truckId = req.body.truck_id;
	var loadoutNumber = req.body.loadout_no;
	var deliveryDate = moment(req.body.delivery_date, 'YYYY-MM-DD').format('YYYY-MM-DD');

	var findLoadout = {
		loadout_number : loadoutNumber,
		date_created : deliveryDate,
		truck_id : truckId
	};

	if(!Array.isArray(orders)){
		orders = [orders];
	}

	Load_out.findOne(findLoadout).then(function (foundLoadout){
		console.log(foundLoadout);
		if(foundLoadout){
			var accumulatedWeight = 0;

			new Promise(function (resolve){
				resolve(orders);
			})

			.each(function (order){
				return new Promise(function (resolve){

					LoadOutService.countOrderWeight(order.productslist)
						.then(function (resultWeight){
							accumulatedWeight = accumulatedWeight + resultWeight;
							resolve();
						})
				});
			})

			.then(function (){
				var totalWeight = foundLoadout.current_weight + accumulatedWeight;

				if(totalWeight > foundLoadout.max_weight){
					return res.send({message : "Can't accomodate orders, it exceeds the truck capacity"}, 400);
				}else{
					next();
				}
			})

		}else{
			next();
		}
	});
};