module.exports = function (req, res, next){
	var orders = req.body.orders;

	if(orders.length < 1){
		return res.send("Invalid! There are no orders");
	}else{
		next();
	}
}