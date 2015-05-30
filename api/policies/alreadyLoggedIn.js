module.exports = function(req, res, next){
	var token = req.headers.authorization;

	if(token){
		return res.json({status : {code : 0, message :'You are already logged in.'}}, 400);
	}

	next();
}