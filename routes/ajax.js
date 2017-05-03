var async = require('async');

exports.logout = function(req, res) {
	res.redirect('/login');
};

exports.sessChk = function(req, res) {
	console.log('session:', req.session);
	res.json(req.session);
};