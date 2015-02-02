module.exports = function(req, res, next){
	var token;

	if(req.headers.authorization){
		var parts = req.headers.authorization.split(' ');

		if(parts.length == 2){
			if(parts[0] === 'Bearer'){
				token = parts[1];
			}
		}else{
			return res.json({error : 'Format is Authorization : Bearer [token]'});
		}
	}else{
		return res.json({error : 'Authorization header not found'});
	}
	
	

	Auth.verifyToken(token, function(err, token){
		if(err)
			return res.json({error : 'Token not valid.'});

		req.token = token;

		next();
	});
}