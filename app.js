
/**
 * Module dependencies.
 */
global.__path = __dirname + '/';

global.randString = function (len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < len; i++ )
    	text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};

global.str2date = function(str) {
	if (typeof str === 'string') {
		return new Date(Number(str));
	} else if (typeof str === 'number') {
		return new Date(str);
	} else {
		console.log('invalid usage of str2date', typeof str);
		return new Date();
	}
};


var express = require('express')
  , app = express()
  , server = require('http').Server(app)
  , io = require('socket.io')(server)
  , mongoose = require('mongoose')
  , bodyParser = require('body-parser')
  , fs = require('fs')
  , path = require('path')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , multer = require('multer')
  , mkdirp = require('mkdirp');
  // , redis = require('redis')
  // , sharedsession = require("express-socket.io-session");


// var app = express();
var port = process.env.PORT || 3000;

if (fs.existsSync(__path + 'config.json')) {
	var global_json = JSON.parse(fs.readFileSync(__path + 'config.json'));
	Object.keys(global_json).map(function(key) {
		global[key] = global_json[key];
	});
} else {
	console.log( __path + 'config.json 파일을 설정해주십시오');
}

__storage_path = __path + __storage_path;
__temp_path = __path + __temp_path;

var multer_upload = multer({dest: __temp_path });
console.log('__temp_path:', __temp_path);

if (!fs.existsSync(__temp_path)) {
	mkdirp(__temp_path, function(err) {
		if (err) {
			console.log('creating temp directory failed!', err);
		}
	});
}
/*
global.__client = redis.createClient(__redisPort, __redisHost);
__client.on('error', function (err) {
    console.log('redis err:', err);
});
*/

var sessChk = function(needSession) {
	if (needSession) { //로그인한 상태에서만 접근 가능한 페이지
		return function(req, res, next) {
			if (req.session && req.session.user_id) {
				next();
			} else {
				res.json({
					err: '로그인 하셔야합니다.'
				});
				//res.redirect('/login');
			}
		};
	} else {
		return function(req, res, next) { //로그인 하지 않은 상태에서만 접근 가능한 페이지
			if (req.session && req.session.user_id) {
				res.json({
					err: '로그인한 상태에서는 접근하실 수 없습니다.'
				});
				// res.redirect('/lobby');
			} else {
				next();
			}
		};
	}
};

var pageSessChk = function(needSession) {
	if (needSession) { //로그인한 상태에서만 접근 가능한 페이지
		return function(req, res, next) {
			if (req.session && req.session.user_id) {
				next();
			} else {
				res.redirect('/login');
			}
		};
	} else {
		return function(req, res, next) { //로그인 하지 않은 상태에서만 접근 가능한 페이지
			if (req.session && req.session.user_id) {
				res.redirect('/dashboard');
			} else {
				next();
			}
		};
	}
};


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('MagicStrinG'));
app.use(express.static(path.join(__dirname, 'public')));

var sessionMiddleware = session({ 
	secret: 'EineKleineNachtMusik',
	resave: true, 
	saveUninitialized: true,
	cookie: { 
		maxAge: 1000 * 60 * 60 * 12, //12시간
		secure: false
	} 
});

// io.use(sharedsession(sessionMiddleware, {
//     autoSave: true
// })); 

app.use(sessionMiddleware);
app.set('port', port);

mongoose.connect(__mongodb_host);

var db_conn = mongoose.connection;
db_conn.on('error', console.error.bind(console, 'connection error:'));
db_conn.once('open', function() {
	console.log('mongodb connection established successfully');
});

var routes_view = require('./routes/view')
  , routes_ajax = require('./routes/ajax')
  , routes_sock = require('./routes/socket');


//테스트용 API
app.get('/', routes_view.index);

app.get('/login', pageSessChk(false), routes_view.loginPage);
app.get('/register', pageSessChk(false), routes_view.registerPage);
app.get('/dashboard', pageSessChk(true), routes_view.dashboard);

app.get('/dashboard/team_list', pageSessChk(true), routes_view.teamListPage);
app.get('/dashboard/create_team', pageSessChk(true), routes_view.createTeamPage);
app.get('/dashboard/team_schedule', pageSessChk(true), function(req, res) {
	var html = [
		'<!doctype html>',
			'<html>\n',
				'<body>\n',
					'<script>\n',
						'alert("팀을 선택하셔야 합니다.");\n',
						'location.href="/dashboard/team_list";\n',
					'</script>\n',
				'</body>\n',
			'</html>'
	].join('');
	res.send(html);
	//res.redirect('/dashboard/team_list');
});
app.get('/dashboard/team_schedule/:team_id', pageSessChk(true), routes_view.teamSchedulePage);

app.get('/dashboard/user_profile', pageSessChk(true), routes_view.userProfilePage);

app.get('/calendar', routes_view.calendarPage);
app.get('/news_feed', routes_view.newsFeedPage);

app.get('/report', routes_view.reportPage);



app.all('/ajaxTest', routes_ajax.ajaxTest);
app.all('/sessChk', routes_ajax.sessChk);
//테스트용 API

app.get('/user/login', sessChk(false), routes_ajax.loginUser);
app.get('/user/logout', routes_ajax.logoutUser);
app.put('/user/signup', sessChk(false), routes_ajax.signupUser);
app.get('/user', sessChk(true), routes_ajax.getUserById);
app.post('/user', sessChk(true), routes_ajax.updateUser);

app.get('/team/report/:team_id', sessChk(true), routes_ajax.getReport);
app.post('/team/report/:team_id', sessChk(true), routes_ajax.modifyReport);
app.put('/team/report/:team_id', sessChk(true), routes_ajax.createReport);
app.delete('/team/report/:team_id', sessChk(true), routes_ajax.deleteReport);

app.get('/user/schedule/sync', sessChk(true), routes_ajax.syncSchedule);
app.get('/user/schedule/list', sessChk(true), routes_ajax.getUserScheduleList);
app.get('/user/schedule', sessChk(true), routes_ajax.getUserSchedule);
app.put('/user/schedule', sessChk(true), routes_ajax.addSchedule);
app.post('/user/schedule', sessChk(true), routes_ajax.modifyUserSchedule);
app.delete('/user/schedule', sessChk(true), routes_ajax.deleteUserSchedule);

app.get('/team/file/:team_id/list', sessChk(true), routes_ajax.getFileList);
app.get('/team/file/:team_id', sessChk(true), routes_ajax.downloadFile);
app.post('/team/file/:team_id', sessChk(true), routes_ajax.modifyFileMetaData);
app.post('/team/file/:team_id/upload', sessChk(true), multer_upload.single('upload'), routes_ajax.uploadFile);
app.delete('/team/file/:team_id', sessChk(true), routes_ajax.deleteFileName);

app.get('/team/invitations/:team_id', sessChk(true), routes_ajax.getTeamInvitation);
app.put('/team/invitations/:team_id', sessChk(true), routes_ajax.inviteMember);
app.delete('/team/invitations/:team_id', sessChk(true), routes_ajax.cancelInvitation);


// chat
app.put('/team/chat/:team_id', sessChk(true), routes_ajax.sendChat);
app.get('/team/chat/search/:team_id', sessChk(true), routes_ajax.searchChatting);
app.get('/team/chat/:team_id', sessChk(true), routes_ajax.getTeamChat);

// notice
app.put('/team/notice/:team_id', sessChk(true), routes_ajax.addNotice);
app.get('/team/notice/:team_id', sessChk(true), routes_ajax.getNotice);
app.delete('/team/notice/:team_id', sessChk(true), routes_ajax.deleteNotice);

//team schedule
app.get('/team/schedule/:team_id', sessChk(true), routes_ajax.getTeamSchedule);
app.post('/team/schedule/:team_id', sessChk(true), routes_ajax.modifyTeamSchedule);
app.put('/team/schedule/:team_id', sessChk(true), routes_ajax.addTeamSchedule);
app.delete('/team/schedule/:team_id', sessChk(true), routes_ajax.deleteTeamSchedule);

// team
app.put('/team', sessChk(true), routes_ajax.createTeam);
app.get('/team/:team_id', sessChk(true), routes_ajax.getTeamData);
app.post('/team/:team_id', sessChk(true), routes_ajax.updateTeam);
app.delete('/team/:team_id', sessChk(true), routes_ajax.deleteTeam);

// user invite
app.get('/user/invite', sessChk(true), routes_ajax.getMyInvitations);
app.post('/user/invite', sessChk(true), routes_ajax.acceptInvitation);
app.delete('/user/invite', sessChk(true), routes_ajax.rejectInvitation);

routes_sock.init_io(io);
global.__io = io;

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});