var jwt = require('jsonwebtoken');
var secret = process.env.SECRET_TOKEN || 'fmmktg' + new Date().getDate();

module.exports.issueToken = function(payload){
	var token = jwt.sign(payload, secret, {expiresInMinutes : 600});
	return token;
}

module.exports.verifyToken = function(token, validated){
	return jwt.verify(token, secret, {}, validated);
}