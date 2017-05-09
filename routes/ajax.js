var async = require('async');
var db = {
	user: require(__path + 'modules/db/user')
};

exports.login = function(req, res) {
	if (Object.keys(req.query).length) {
		req.body = req.query;
	}
	var user_id = req.body.user_id || "";
	var password = req.body.password || "";
	async.waterfall([
		cb => {
			if (!user_id || !password) {
				return cb('please insert id and password');
			}
			cb(null);
		},
		cb => {
			db.user.findOne({
				user_id: user_id,
				password: password
			}, function(err, user_data) {
				if (err) {
					return cb(err);
				}
				if (!user_data) {
					return cb('invalid id or password');
				} 
				req.session.regenerate(function(err) {
					
					req.session.user_id = user_data.user_id;
					req.session.user_name = user_data.user_name;
					req.session.email = user_data.email;
					req.session.phone = user_data.phone;

					cb(err, '로그인 성공');
				});
			});
		}
	], function(err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			})
		}
	});
};

exports.signup = function(req, res) {
	if (Object.keys(req.query).length) {
		req.body = req.query;
	}
	
	var user_id = req.body.user_id || "";
	var user_name = req.body.user_name || "";
	var password = req.body.password || "";
	var email = req.body.email || "";
	var phone = req.body.phone || "";
	
	async.waterfall([
		cb => {
			if (!user_id || !user_name || !password) {
				cb('invalid inputs');
			} else {
				cb(null);
			}
		},
		cb => {
			db.user.find({
				user_id: user_id
			}, function(err, result) {
				if (err) {
					return cb(err);
				}
				cb(null, err);
			});
		},
		(user_data, cb) => {
			if (user_data) {
				return cb('user data already exist');
			}
			var snapshot = new db.user({
				user_id: user_id,
				user_name: user_name,
				password: password,
				email: email,
				phone: phone
			});
			
			snapshot.save(function(err) {
				if (err) {
					cb(err);
				} else {
					cb(null, '회원가입 성공!');
				}
			});
		}
	], function(err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}
	});
};
exports.logout = function(req, res) {
	res.redirect('/login');
};

exports.ajaxTest = function(req, res) {
	var msg = {
		method: req.method,
		query: req.query,
		body: req.body
	};
	
	res.send(JSON.stringify(msg));
};

exports.sessChk = function(req, res) {
	console.log('session:', req.session);
	res.json(req.session);
};