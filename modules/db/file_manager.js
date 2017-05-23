var mongoose = require('mongoose');

var schema = mongoose.Schema({
	team_id: String,
	file_id: String,
	file_path: String, //실제 서버에 저장되는 path
	file_name: String, //사용자가 확인하는 파일 이름
	contents: String,
	uploader: String, //user_id
	upload_time: Date
});

var file_manager = mongoose.model('file_manager', schema);

module.exports = file_manager;