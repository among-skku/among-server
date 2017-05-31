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
		contents: 'fragment/contents_default',
		footer: 'fragment/footer_default',
		sidebar: 'fragment/sidebar_default',
		navbar: 'fragment/navbar'
	});
};