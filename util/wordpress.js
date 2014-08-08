var https         = require('https'),
	fs            = require('fs'),
	path          = require('path'),
	chalk         = require('chalk'),
	exec          = require('child_process').exec,
	EventEmitter  = require('events').EventEmitter;


function getSaltKeys(callback) {
	var ee = new EventEmitter(),
		keys = '';

	https.get("https://api.wordpress.org/secret-key/1.1/salt/", function(res) {
		res.on('data', function(d) {
			keys += d.toString();
		}).on('end', function() {
			ee.emit('end', keys);
		});
	});

	if (typeof callback === 'function') {
		ee.on('end', callback);
	}

	return ee;
};


function installTheme(generator, config, done) {
    if (config.themeType == 'GitHub') {
        generator.remote(config.themeUser, config.themeRepo, config.themeBranch, function(err, remote) {
            remote.directory('.', path.join('wp-content/themes', config.themeDir));
            done();
        });
    } else if (config.themeType == 'Zip File') {
        generator.tarball(config.themeTarballUrl, path.join('wp-content/themes', config.themeDir), done);
    }
};


function setupTheme(generator, config, done) {
	console.log(chalk.green('Setting up theme'));

	var themePath = 'wp-content/themes/' + config.themeDir,
		themePackageJson = themePath + '/package.json';

	if (fs.existsSync(themePackageJson)) {
		var oldDir = process.cwd();
		process.chdir(themePath);
		exec('npm install', function(err) {
			if (fs.existsSync('Gruntfile.js')) {
				exec('grunt setup', function(err) {
					console.log(chalk.green('Setting up Grunt'));
					process.chdir(oldDir);
					done();
				});
			}
		});
	}
};


module.exports = {
	getSaltKeys : getSaltKeys,
	installTheme : installTheme,
	setupTheme : setupTheme
};