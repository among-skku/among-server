var async = require('async');

exports.index = function(req, res){
	res.render('index', { title: 'Express' });
};

exports.loginPage = function(req, res) {
	res.render('login');
};

exports.login = function(req, res) {
	res.render('login');
};
