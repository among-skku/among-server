var mongoose = require('mongoose');

var schema = mongoose.Schema({
	team_id: String,
	sender_id: String,
	message_id: String,
	time: Date,	
});

var chat = mongoose.model('chat', schema);

module.exports = chat;