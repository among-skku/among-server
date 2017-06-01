var async = require('async');

exports.index = function(req, res){
	res.redirect('/login');
	//res.render('index', { title: 'Express' });
};

exports.loginPage = function(req, res) {
	res.render('login_register', {
		exec_code: '//'
	});
};

exports.registerPage = function(req, res) {
	res.render('login_register', {
		exec_code: 'swap_page("#signup-box")'
	});
};

exports.login = function(req, res) {
	res.render('login');
};

exports.dashboard = function(req, res) {
	res.render('dashboard', {
		contents: 'fragment/among_contents',
		footer: 'fragment/among_footer',
		sidebar: 'fragment/among_sidebar',
		navbar: 'fragment/among_navbar'
	});
};