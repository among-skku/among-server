var async = require('async');

exports.index = function(req, res){
	res.redirect('/login');
	//res.render('index', { title: 'Express' });
};

exports.loginPage = function(req, res) {
	res.render('login');
};

exports.registerPage = function(req, res) {
	res.render('register');
};

exports.login = function(req, res) {
	res.render('login');
};
