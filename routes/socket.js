var async = require('async');

var rand_string = function(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};

module.exports = {
	init_io: function(io) {
		io.on('connection', function(socket) {
			socket.on('disconnect', function() {
				var user_id = socket.handshake.session.user_id;
				var room_no = socket.handshake.session.room_no;
			});
			
			socket.on('message', function(msg){
				var room_no = socket.handshake.session.room_no;
				var user_id = socket.handshake.session.user_id;
				var is_dead = socket.handshake.session.is_dead;
				var game_id = socket.handshake.session.game_id || false;
				var job = socket.handshake.session.job || false;
				var content = msg.content;
				
			});
		});
	}	
};