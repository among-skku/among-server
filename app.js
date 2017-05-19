
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
		return null;
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
  , cookieParser = require('cookie-parser');
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
app.all('/ajaxTest', routes_ajax.ajaxTest);
app.all('/sessChk', routes_ajax.sessChk);
//테스트용 API

app.get('/user/login', sessChk(false), routes_ajax.loginUser);
app.get('/user/logout', sessChk(true), routes_ajax.logoutUser);
app.put('/user/signup', sessChk(false), routes_ajax.signupUser);
app.get('/user', sessChk(true), routes_ajax.getUserById);
app.post('/user', sessChk(true), routes_ajax.updateUser);

app.get('/team/report/:team_id', sessChk(true), routes_ajax.getReport);
app.post('/team/report/:team_id', sessChk(true), routes_ajax.modifyReport);
app.put('/team/report/:team_id', sessChk(true), routes_ajax.createReport);
app.delete('/team/report/:team_id', sessChk(true), routes_ajax.deleteReport);

app.get('/user/schedule/sync', sessChk(true), routes_ajax.syncSchedule);

app.get('/user/schedule', sessChk(true), routes_ajax.getUserSchedule);
app.put('/user/schedule', sessChk(true), routes_ajax.addSchedule);


routes_sock.init_io(io);
global.__io = io;

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});