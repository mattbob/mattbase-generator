// Requirements
var util         = require('util'),
	fs           = require('fs'),
	yeoman       = require('yeoman-generator'),
	wrench       = require('wrench'),
	chalk        = require('chalk'),
	rimraf       = require('rimraf'),
	git          = require('simple-git')(),
	wordpress    = require('../util/wordpress'),
	art          = require('../util/art'),
	Logger       = require('../util/log'),
	Config       = require('../util/config');

// Export the module
module.exports = Generator;

// Extend the base generator
function Generator(args, options, config) {
	yeoman.generators.Base.apply(this, arguments);

	// Log level option
	this.option('log', {
		desc: 'The log verbosity level: [ verbose | log | warn | error ]',
		defaults: 'log',
		alias: 'l',
		name: 'level'
	});

	// Enable advanced features
	this.option('advanced', {
		desc: 'Makes advanced features available',
		alias: 'a'
	});

	// Shortcut for --log=verbose
	this.option('verbose', {
		desc: 'Verbose logging',
		alias: 'v'
	});
	if (this.options.verbose) {
		this.options.log = 'verbose';
	}

	// Setup the logger
	this.logger = Logger({
		level: this.options.log
	});

	// Log the options
	this.logger.verbose('\nOptions: ' + JSON.stringify(this.options, null, '  '));

	// Load the config files
	this.conf = new Config();
};

util.inherits(Generator, yeoman.generators.Base);



// Ask the user what they want done
Generator.prototype.ohTellMeWhatYouWantWhatYouReallyReallyWant = function() {
	// This is an async step
	var done = this.async(),
		me = this;

	// Display welcome message
	this.logger.log(art.wp, {logPrefix: ''});

	// Get the current version number of wordpress
	this.logger.verbose('Getting current WP version');
	wordpress.getCurrentVersion(function(err, ver) {
		if (err) me.logger.warn('Error getting WP versions.  Falling back to ' + ver);
		me.logger.verbose('Got current WP version: ' + ver);
		me.conf.set('wpVer', ver);
		getInput();
	});

	// Get the input
	function getInput() {
		me.prompt(require('./prompts')(me.options.advanced, me.conf.get()), function(input) {
			me.prompt([{
				message: 'Does this all look correct?',
				name: 'confirm',
				type: 'confirm'
			}], function(i) {
				if (i.confirm) {
					// Set port
					var portRegex = /:[\d]+$/;
					var port = input.url.match(portRegex);
					if (port) input.port = port[0].replace(':', '');

					// Remove port from url
					input.url = input.url.replace(portRegex, '');

					// Save the users input
					me.conf.set(input);
					me.logger.verbose('User Input: ' + JSON.stringify(me.conf.get(), null, '  '));
					me.logger.log(art.go, {logPrefix: ''});
					done();
				} else {
					console.log();
					getInput();
				}
			});
		});
	}
};

Generator.prototype.createGitignore = function() {
	if (this.conf.get('git')) {
		this.logger.verbose('Copying .gitignore file');
		this.copy('gitignore.tmpl', '.gitignore');
		this.logger.verbose('Done copying .gitignore file');
	}
};

Generator.prototype.initialGitCommit = function() {
	if (this.conf.get('git')) {
		var done = this.async(),
			me = this;

		this.logger.log('Initializing Git');
		git.init(function(err) {
			if (err) me.logger.error(err);

			me.logger.verbose('Git init complete');
			git.add('.', function(err) {
				if (err) me.logger.error(err);
			}).commit('Initial Commit', function(err, d) {
				if (err) me.logger.error(err);

				me.logger.verbose('Git add and commit complete: ' + JSON.stringify(d, null, '  '));
				done();
			});
		});
	}
};

Generator.prototype.installWP = function() {
	var done = this.async(),
		me   = this;

	this.logger.log('Installing WordPress ' + this.conf.get('wpVer'));
	this.remote('wordpress', 'wordpress', this.conf.get('wpVer'), function(err, remote) {
		remote.directory('.', '.');
		me.logger.log('WordPress installed');
		done();
	});
};

Generator.prototype.configSetup = function() {
	var done = this.async(),
		me   = this;

	this.logger.log('Getting salt keys');
	wordpress.getSaltKeys(function(saltKeys) {
		me.logger.verbose('Salt keys: ' + JSON.stringify(saltKeys, null, '  '));
		me.conf.set('saltKeys', saltKeys);
		me.logger.verbose('Copying wp-config');
		me.template('wp-config.php.tmpl', 'wp-config.php');
		done();
	});
};

Generator.prototype.createLocalConfig = function() {
	this.logger.verbose('Copying wp-config');
	this.template('local-config.php.tmpl', 'local-config.php');
};

Generator.prototype.setPermissions = function() {
	if (fs.existsSync('.')) {
		this.logger.log('Setting Permissions: 0755 on .');
		wrench.chmodSyncRecursive('.', 0755);
		this.logger.verbose('Done setting permissions on .');
	}
};

Generator.prototype.commitWordPress = function() {
	if (this.conf.get('git')) {
		var done = this.async(),
			me = this;

		this.logger.verbose('Committing WP to Git');

		git.add('.', function(err) {
			if (err) me.logger.error(err);
		}).commit('Installed wordpress', function(err, d) {
			if (err) me.logger.error(err);
			me.logger.verbose('Done committing: ' + JSON.stringify(d, null, '  '));
			done();
		});
	}
};

Generator.prototype.removeDefaultThemes = function() {
	var self = this;

	fs.readdir('wp-content/themes', function (err, files) {
		if (typeof files !== 'undefined' && files.length !== 0) {
			files.forEach(function (file) {
		    	var pathFile = fs.realpathSync('wp-content/themes/' + file),
		    	isDirectory = fs.statSync(pathFile).isDirectory();

		    	if (isDirectory) {
		    		rimraf.sync(pathFile);
		    		self.log.writeln('Removing ' + pathFile);
		    	}
		    });
		}
	});
}

Generator.prototype.installTheme = function() {
	if (this.conf.get('installTheme')) {
		var done = this.async()
			me = this;

		this.logger.log('Setting up theme');
		wordpress.installTheme(this, this.conf.get(), function() {
			me.logger.verbose('Theme install complete');
			done();
		});
	}
};

Generator.prototype.installACFplugin = function() {
	var plugins = this.conf.get('pluginsList');

	if(plugins.indexOf('ACFplugin') > -1) {
		var done = this.async();
		this.logger.log('Installing Advanced Custom Fields plugin');
		wordpress.installACF(this, this.conf.get(), function() {
			done();
		});
	}
}

Generator.prototype.installGFplugin = function() {
	var plugins = this.conf.get('pluginsList');

	if(plugins.indexOf('gravityForms') > -1) {
		var done = this.async();
		this.logger.log('Installing Gravity Forms plugin');
		this.directory('gravityforms', 'wp-content/plugins/gravityforms');
		done();
	}
}

Generator.prototype.installSPOplugin = function() {
	var plugins = this.conf.get('pluginsList');

	if(plugins.indexOf('simplePageOrdering') > -1) {
		var done = this.async();
		this.logger.log('Installing Simple Page Ordering plugin');
		this.directory('simple-page-ordering', 'wp-content/plugins/simple-page-ordering');
		done();
	}
}

Generator.prototype.installHelpfulInformation = function() {
	var plugins = this.conf.get('pluginsList');

	if(plugins.indexOf('helpfulInformation') > -1) {
		var done = this.async();
		this.logger.log('Installing Helpful Information plugin');
		this.directory('helpful-information', 'wp-content/plugins/helpful-information');
		done();
	}
}

Generator.prototype.installMenuEditor = function() {
	var plugins = this.conf.get('pluginsList');

	if(plugins.indexOf('adminMenuEditor') > -1) {
		var done = this.async();
		this.logger.log('Installing Admin Menu Editor plugin');
		this.directory('admin-menu-editor', 'wp-content/plugins/admin-menu-editor');
		done();
	}
}

Generator.prototype.installWordPressSEO = function() {
	var plugins = this.conf.get('pluginsList');

	if(plugins.indexOf('wordpressSEO') > -1) {
		var done = this.async();
		this.logger.log('Installing WordPress SEO plugin');
		this.directory('wordpress-seo', 'wp-content/plugins/wordpress-seo');
		done();
	}
}

Generator.prototype.installGoogleSitemapGenerator = function() {
	var plugins = this.conf.get('pluginsList');

	if(plugins.indexOf('googleSitemapGenerator') > -1) {
		var done = this.async();
		this.logger.log('Installing Google Sitemap Generator plugin');
		this.directory('google-sitemap-generator', 'wp-content/plugins/google-sitemap-generator');
		done();
	}
}

Generator.prototype.removeHelloDolly = function() {
	var done = this.async()
		me = this;

	rimraf('wp-content/plugins/hello.php', function () {
        me.logger.log('Removing Hello Dolly');
        done();
    });
}

Generator.prototype.setupTheme = function() {
	if (this.conf.get('installTheme')) {
		this.logger.log('Starting theme setup');
		wordpress.setupTheme(this, this.conf.get(), this.async());
		this.logger.verbose('Theme setup complete');
	}
};

Generator.prototype.commitTheme = function() {
	if (this.conf.get('git') && this.conf.get('installTheme')) {
		var done = this.async(),
			me = this;

		this.logger.verbose('Committing theme to Git');

		git.add('.', function(err) {
			if (err) me.logger.error(err);
		}).commit('Installed theme', function(err, d) {
			if (err) me.logger.error(err);
			me.logger.verbose('Done committing: ', JSON.stringify(d, null, '  '));
			done();
		});
	}
};

Generator.prototype.saveSettings = function() {
	this.logger.log('Writing .mattbase file');
	fs.writeFileSync('.mattbase', JSON.stringify(this.conf.get(), null, '\t'));
};

Generator.prototype.finishedMessage = function() {
	this.logger.log(chalk.bold.green('\nThat\'s all folks!\n'), {logPrefix: ''});
};