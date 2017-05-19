var mongoose = require('mongoose');

//개인의 일시적인 일정
var schema = mongoose.Schema({
	schedule_id: String,
	place: String,
	title: String,
	contents: String,
	start_date: Date, //기간
	end_date: Date,
	start_time: String, //시각 12:33 와 같은 포맷
	end_time: String,
	day: String //요일
});

var regular_schedule = mongoose.model('regular_schedule', schema);

module.exports = regular_schedule;