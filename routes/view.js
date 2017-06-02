var async = require('async');

var db = {
	user: require(__path + 'modules/db/user'),
	report: require(__path + 'modules/db/report'),
	regular_schedule: require(__path + 'modules/db/regular_schedule'),
	temporal_schedule: require(__path + 'modules/db/temporal_schedule'),
	team_schedule: require(__path + 'modules/db/team_schedule'),
	chat: require(__path + 'modules/db/chat'),
	chat_data: require(__path + 'modules/db/chat_data'),
	notice: require(__path + 'modules/db/notice'),
	file_manager: require(__path + 'modules/db/file_manager'),
	team: require(__path + 'modules/db/team'),
	invitation: require(__path + 'modules/db/invitation')
};

exports.index = function(req, res){
	if (req.session && req.session.user_id) {
		res.redirect('/dashboard');
	} else {
		res.redirect('/login');
	}
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
	var user_name = req.session.user_name || 'anonymous';
	var team_id = req.query.team_id || '';
	res.render('dashboard', {
		contents: 'contents/dashboard_main',
		footer: 'fragment/among_footer',
		sidebar: 'fragment/among_sidebar',
		navbar: 'fragment/among_navbar',
		user_name: user_name,
		team_id: team_id
	});
};

exports.teamListPage = function(req, res) {
	var user_name = req.session.user_name || 'anonymous';
	var team_id = req.query.team_id || '';
	res.render('dashboard', {
		contents: 'contents/team_list',
		footer: 'fragment/among_footer',
		sidebar: 'fragment/among_sidebar',
		navbar: 'fragment/among_navbar',
		user_name: user_name,
		team_id: team_id,
	});
};

exports.createTeamPage = function(req, res) {
	var user_name = req.session.user_name || 'anonymous';
	var team_id = req.query.team_id || '';
	var user_id = req.session.user_id || '로그인 해주세요';
	res.render('dashboard', {
		contents: 'contents/create_team',
		footer: 'fragment/among_footer',
		sidebar: 'fragment/among_sidebar',
		navbar: 'fragment/among_navbar',
		team_id: team_id,
		user_id: user_id,
		user_name: user_name
	});
};

exports.teamSchedulePage = function(req, res) {
	var team_id = req.params.team_id;
	var user_name = req.session.user_name || 'anonymous';
	async.waterfall([
		function(cb) {
			db.team.findOne({
				team_id: team_id
			}, function(err, team_data) {
				if (!team_data) {
					cb('유효하지 않은 팀입니다.');
				} else {
					cb(err, null);
				}
			});
		}
	], function(err) {
		if (err) {
			res.json({
				err: '팀을 찾을 수 없습니다.'
			});
		} else {
			res.render('dashboard', {
				contents: 'contents/team_schedule',
				footer: 'fragment/among_footer',
				sidebar: 'fragment/among_sidebar',
				navbar: 'fragment/among_navbar',
				team_id: team_id,
				user_name: user_name
			});
		}
	});
	
};

exports.calendarPage = function (req, res) {
	res.render('calendar');
};

exports.newsFeedPage = function (req, res) {
	res.render('news_feed');
};

