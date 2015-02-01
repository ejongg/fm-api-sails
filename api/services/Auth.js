var jwt = require('jsonwebtoken');
var secret = 'fmmktg';

module.exports.issueToken = function(payload){
	var token = jwt.sign(payload, secret);
	return token;
}

module.exports.verifyToken = function(token, validated){
	return jwt.verify(token, secret, {}, validated);
}