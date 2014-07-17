var https         = require('https'),
	fs            = require('fs'),
	path          = require('path'),
	mysql         = require('mysql'),
	chalk         = require('chalk'),
	exec          = require('child_process').exec,
	EventEmitter  = require('events').EventEmitter,
	wordpressRepo = "git://github.com/WordPress/WordPress.git";

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

function getCurrentVersion(callback) {
	var latestVersion = '3.9.1';

	require('simple-git')().listRemote('--tags '+ wordpressRepo, function(err, tagsList) {
		if (err) return callback(err, latestVersion);

		tagList = ('' + tagsList).split('\n');
		tagList.pop();
		lastTag = /\d\.\d\.\d/ig.exec(tagList.pop());

		if (lastTag !== null) {
			latestVersion = lastTag[0];
		}

		callback(null, latestVersion);
	});
};

function loadConfig() {
	var ee = new EventEmitter();

	function readConfig(path) {
		fs.readFile(path, {encoding:'utf8'}, function(err, contents) {
			if (err) return ee.emit('error', err);
			ee.emit('done', contents);
		});
	}

	fs.exists('wp-config.php', function(exists) {
		if (exists) {
			readConfig('wp-config.php');
		} else {
			fs.exists('../wp-config.php', function(exists) {
				if (exists) {
					readConfig('../wp-config.php');
				} else {
					ee.emit('error', 'Config file does not exist.');
				}
			});
		}
	});

	return ee;
};

function getDbCredentials() {
	var ee = new EventEmitter();

	loadConfig().on('done', function(contents) {
		var db    = {};
		db.name   = contents.match(/define\(["']DB_NAME["'],[\s]*["'](.*)["']\)/)[1];
		db.user   = contents.match(/define\(["']DB_USER["'],[\s]*["'](.*)["']\)/)[1];
		db.pass   = contents.match(/define\(["']DB_PASSWORD["'],[\s]*["'](.*)["']\)/)[1];
		db.host   = contents.match(/define\(["']DB_HOST["'],[\s]*["'](.*)["']\)/)[1];
		db.prefix = contents.match(/\$table_prefix[\s]*=[\s]*["'](.*)["']/)[1];
		ee.emit('done', db);
	}).on('error', function(err) {
		ee.emit('error', err);
	});

	return ee;
};

function getContentDir() {
	var ee = new EventEmitter();

	function checkSimpleContentLocations() {
		fs.exists('wp-content', function(exists) {
			if (exists) {
				fs.realpath('wp-content', function(err, p) {
					if (err) return ee.emit('error', err);
					ee.emit('done', path.relative('.', p));
				});
			} else {
				fs.exists('content', function(exists) {
					if (exists) {
						fs.realpath('content', function(err, p) {
							if (err) erroree.emit('error', err);
							ee.emit('done', path.relative('.', p));
						});
					} else {
						ee.emit('error', 'Cannot determine content directory.');
					}
				});
			}
		});
	}

	loadConfig().on('done', function(contents) {
		var matches = contents.match(/define\(["']WP_CONTENT_DIR["'],[\s]*(.*)\)/);

		if (matches && matches[1]) {
			exec('php -r "echo ' + matches[1] + ';"', function(err, stdout) {
				if (err) return checkSimpleContentLocations();

				fs.exists(stdout, function(exists) {
					if (exists) {
						ee.emit('done', path.relative('.', stdout));
					} else {
						checkSimpleContentLocations();
					}
				});
			});
		} else {
			checkSimpleContentLocations();
		}
	}).on('error', function(err) {
		checkSimpleContentLocations();
	});

	return ee;
};

function installTheme(generator, config, done) {
    if (config.themeType == 'git') {
        generator.remote(config.themeUser, config.themeRepo, config.themeBranch, function(err, remote) {
            remote.directory('.', path.join('wp-content/themes', config.themeDir));
            done();
        });
    } else if (config.themeType == 'tar') {
        generator.tarball(config.themeTarballUrl, path.join('wp-content/themes', config.themeDir), done);
    }
};

function installACF(generator, config, done) {
    generator.remote('elliotcondon', 'acf', 'master', function(err, remote) {
        remote.directory('.', path.join('wp-content/plugins', 'acf'));
        done();
    });
};

function setupTheme(generator, config, done) {
	console.log(chalk.green('Setting Up Theme'));

	var themePath = 'wp-content/themes/' + config.themeDir,
		themePackageJson = themePath + '/package.json';

	if (fs.existsSync(themePackageJson)) {
		var oldDir = process.cwd();
		process.chdir(themePath);
		exec('npm install', function(err) {
			if (fs.existsSync('Gruntfile.js')) {
				exec('grunt setup', function(err) {
					console.log(chalk.green('Theme setup!'));
					process.chdir(oldDir);
					done();
				});
			} else {
				console.log(chalk.red('Gruntfile.js missing!'));
				process.chdir(oldDir);
				done();
			}
		});
	} else {
		console.log(chalk.red('package.json missing!'));
		done();
	}
};


module.exports = {
	repo : wordpressRepo,
	getSaltKeys : getSaltKeys,
	getCurrentVersion : getCurrentVersion,
	getDbCredentials : getDbCredentials,
	loadConfig : loadConfig,
	getContentDir : getContentDir,
	installTheme : installTheme,
	installACF : installACF,
	setupTheme : setupTheme
};