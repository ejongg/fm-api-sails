module.exports = function(req, res, next){
	var token = req.headers.token;

	if(token){
		return res.json({status : {code : 0, message :'You are already logged in.'}});
	}

	next();
}