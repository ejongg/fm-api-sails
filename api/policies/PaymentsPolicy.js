module.exports = function(req, res, next){
	var deliveryId = req.body.delivery_id;
	var paidAmount = req.body.paid_amount;

	Delivery_transactions.findOne({id : deliveryId})
		.then(function (transaction){

			var totalAmount = transaction.paid_amount + paidAmount;

			if(totalAmount > transaction.total_amount){
				var shortage = transaction.total_amount - transaction.paid_amount;
				return res.send("Invalid! The transaction is only " + shortage + " short", 400);
			}else{
				next();
			}
		})
};