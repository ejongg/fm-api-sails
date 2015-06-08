var Promise = require('bluebird');

module.exports = function (req, res, next){
	var orderId = req.body.order_id;

	Customer_orders.findOne({id : orderId})
		.then(function (foundOrder){

			if(foundOrder.delivery_id == null){
				next();
			}else{
				return res.send({message : "Unable to cancel. Order in loadout"}, 400);
			}
		})
};