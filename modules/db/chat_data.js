var mongoose = require('mongoose');

var schema = mongoose.Schema({	
	message_id: String,
	contents: String,	
});

var chat_data = mongoose.model('chat_data', schema);

module.exports = chat_data;