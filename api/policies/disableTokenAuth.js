module.exports = function(req, res, next){
	/*
		This policy is only created to temporarily 
		disable the token auth.
	*/

	next();
}