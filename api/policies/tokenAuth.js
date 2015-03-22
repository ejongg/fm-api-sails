module.exports = function(req, res, next){
	var token;
	
	var auth = req.headers.authorization;

	if(auth){
		var parts = auth.split(' ');

		if(parts.length == 2){
			if(parts[0] === 'Bearer'){
				token = parts[1];
			}
		}else{
			return res.json({error : "Unauthorized", message : "Wrong format"});
		}
	}else{
		return res.json({error : "Unauthorized", message : "Token not found"});
	}
	
	Auth.verifyToken(token, function(err, token){
		if(err)
			return res.json({error : 'Token not valid.'});

		req.token = token;

		next();
	});
}