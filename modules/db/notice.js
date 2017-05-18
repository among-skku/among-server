var mongoose = require('mongoose');

var schema = mongoose.Schema({
	
	team_id: String,
	speaker_id: String,
	notice_id: String,
	title: String,
	contents: String,	
	create_time: Date
	
});

var notice = mongoose.model('notice', schema);

module.exports = notice;