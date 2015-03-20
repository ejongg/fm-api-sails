module.exports = function(req, res, next){
	var token;
	
	if(req.isSocket){
		var auth = req.headers.authorization;

		if(auth){
			var parts = auth.split(' ');

			if(parts.length == 2){
				if(parts[0] === 'Bearer'){
					token = parts[1];
				}
			}else{
				return res.json({error : 'Wrong format'});
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

	}else{
		res.json({error : 'Request must be socket.'});
		next();
	}
}