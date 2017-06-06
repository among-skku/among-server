var commander = require('commander');
var forever = require('forever');

commander.version('among server');

commander
		.command('start [option]')
		.option('-d, --daemon', 'run the among server as a daemon using the forever module')
		.action(function(env, options) {
			var process_options = [];

			if (options.daemon) {
				forever.startDaemon(__dirname + '/app.js', {
					env: { 'NODE_ENV': 'production'},
					spawnWidh: { env : process.env },
					options: process_options
				});
				console.log('among server is starting with daemon mode...');
			}
		});

commander.parse(process.argv);
