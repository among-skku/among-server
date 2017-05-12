var async = require('async');
var db = {
	user: require(__path + 'modules/db/user'),
	report: require(__path + 'modules/db/report')
};

exports.loginUser = function(req, res) {
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

exports.logoutUser = function(req, res) {
	req.session.destroy();
	
	if (req.session) {
		res.json({
			err: '로그아웃 실패'
		});
	} else {
		res.json({
			result: '로그아웃 성공'
		})
	}
};

exports.signupUser = function(req, res) {
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
			db.user.findOne({
				user_id: user_id
			}, function(err, result) {
				if (err) {
					return cb(err);
				}
				cb(null, result);
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

exports.getUserById = function(req, res) {
	if (Object.keys(req.query).length) {
		req.body = req.query;
	}
	var user_id = req.body.user_id || req.session.user_id || '';
	
	async.waterfall([
		cb => {
			if (!user_id) {
				cb('정보를 불러올 유저 정보가 명시되지 않았습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			db.user.findOne({
				user_id: user_id
			}, function(err, data) {
				cb(err, data);
			})
		},
		(user_data, cb) => {
			if (!user_data) {
				cb('해당 유저 정보가 없습니다.');
			} else {
				cb(null, user_data);
			}
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

exports.updateUser = function(req, res) {
	if (Object.keys(req.query).length) {
		req.body = req.query;
	}
	
	var user_id = req.body.user_id || '';
	// var user_name = req.body.user_name || '';
	// var email = req.body.email || '';
	// var password = req.body.password || '';
	// var phone = req.body.phone || '';
	
	var update_data = {};
	var attr_list = ['user_name', 'email', 'password', 'phone'];
	
	attr_list.map(function(attr) {
		if (req.body[attr]) {
			update_data[attr] = req.body[attr];
		}
	});
	
	async.waterfall([
		cb => {
			if (!user_id) {
				cb('user_id가 지정되지 않았습니다.');
			} else {
				cb(null);
			}
		}, 
		cb => {
			db.findOne({
				user_id: user_id
			}, function(err, user_data) {
				cb(err, user_data);
			})
		},
		(user_data, cb) => {
			if (user_data) {
				db.update({
					user_id: user_id,
					
				}, update_data, function(err, result) {
					if (err) {
						cb(err);
					} else {
						cb(null, '유저 정보 변경 성공');
					}			
				});
			} else {
				cb('없는 유저입니다.');
			}
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

exports.getReport = function(req, res) {
	var team_id = req.params.team_id || false;
	var report_id = req.query.report_id || false;
	
	async.waterfall([
		cb => {
			if (!team_id) {
				cb('team_id 값이 없습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			if (!report_id) {
				//report_id가 명시되지 않으면 report_id 리스트를 출력
				db.report.find({
					team_id: team_id
				}, {
					report_id: 1
				}, function(err, data) {
					async.map(data, function(item, next) {
						next(null, item.report_id);
					}, function(inner_err, transformed) {
						cb(err, transformed);
					});
					// cb(err, data);
				});
			} else {
				db.report.findOne({
					team_id: team_id,
					report_id: report_id
				}, function(err, data) {
					cb(err, data);
				});
			}
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

exports.modifyReport = function(req, res) {
	var team_id = req.params.team_id || false;
	var report_id = req.body.report_id || false;
	var title = req.body.title || false;
	var contents = req.body.contents || false;
	var attendee = req.body.attendee || false;
	var update_time = new Date();
	
	if (attendee) {
		try {
			attendee = JSON.parse(attendee);
			if (!Array.isArray(attendee)) {
				throw 'attendee format is not array';
			}
		} catch (e) {
			console.log('routes/ajax.js modifyReport attendee JSON parse error', e);
			attendee = false;
		}
	}
	
	async.waterfall([
		cb => {
			if (!report_id || !team_id) {
				cb('report_id, team_id가 지정되지 않았습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			var write_data = {
				report_id: report_id,
				team_id: team_id,
				update_time: update_time
			};
			if (title) { write_data.title = title; }
			if (contents) { write_data.contents = contents; }
			if (attendee) { write_data.attendee = attendee; }
			
			db.report.update({
				report_id: report_id,
				team_id: team_id
			}, {
				$set: write_data
			}, function(err) {
				if (err) {
					cb(err);
				} else {
					cb(null, '회의록 내용이 정상적으로 수정되었습니다.');
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

exports.createReport = function(req, res) {
	var team_id = req.params.team_id || false;
	var report_id = 'report_' + randString(10);
	var title = req.body.title || '';
	var contents = req.body.contents || '';
	var writer_id = req.session.user_id;
	var create_time = new Date();
	var update_time = create_time;
	
	async.waterfall([
		cb => {
			if (!team_id) {
				cb('team_id가 지정되지 않았습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			var snapshot = new db.report({
				team_id: team_id,
				report_id: report_id,
				title: title,
				contents: contents,
				attendee: [writer_id],
				writer_id: writer_id,
				create_time: create_time,
				update_time: update_time
			});
			
			snapshot.save(function(err) {
				if (err) {
					cb(err);
				} else {
					cb(null, '성공적으로 저장되었습니다.');
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

exports.deleteReport = function(req, res) {
	var team_id = req.params.team_id || false;
	var report_id = req.body.report_id || false;
	
	async.waterfall([
		cb => {
			if (!team_id || !report_id) {
				cb('team_id나 report_id가 없습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			db.report.remove({
				team_id: team_id,
				report_id: report_id
			}, function(err) {
				if (err) {
					cb(err);
				} else {
					cb(null, '정상적으로 회의록이 삭제되었습니다.');
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


exports.ajaxTest = function(req, res) {
	var msg = {
		method: req.method,
		query: req.query,
		body: req.body
	};
	
	console.log('req!:', msg);
	res.send(JSON.stringify(msg));
};

exports.sessChk = function(req, res) {
	console.log('session:', req.session);
	res.json(req.session);
};