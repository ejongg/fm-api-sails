module.exports = function(req, res, next){
	var token = req.headers.token;

	Auth.verifyToken(token, function(err, token){
		if(err)
			return res.json('Token not valid.');

		req.token = token;

		next();
	});
}