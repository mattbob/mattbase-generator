'use strict';

var async = require( 'async' ),
	chalk = require( 'chalk' ),
	path = require( 'path' ),
	util = require( 'util' ),
	shell = require( 'shelljs' ),
	https = require( 'https' ),
	git = require( 'simple-git' )(),
	EventEmitter = require( 'events' ).EventEmitter,
	yeoman = require( 'yeoman-generator' );


var mattbase = function( args, options, config ) {
	yeoman.generators.Base.apply( this, arguments );
};

util.inherits( mattbase, yeoman.generators.Base );

mattbase.prototype.askPrompts = function() {
	var done = this.async(),
		me = this;

	this.log( '' );
	this.log( chalk.green( '    _____     _   _   _                    ' ) );
	this.log( chalk.green( '   |     |___| |_| |_| |_ ___ ___ ___      ' ) );
	this.log( chalk.green( '   | | | | .\'|  _|  _| . | .\'|_ -| -_|   ' ) );
	this.log( chalk.green( '   |_|_|_|__,|_| |_| |___|__,|___|___|     ' ) );
	this.log( '' );
	this.log( chalk.bold.green( 'A Yeoman Generator For WordPress - v1.0.3' ) );
	this.log( '' );

	var requiredValidate = function( value ) {
		if ( value === '' ) {
			return 'This field is required.';
		}
		return true;
	};

	function getInput() {
		var prompts = [ {
			message: 'Site Name:',
			name: 'siteName',
			validate: requiredValidate
		}, {
			message: 'Site URL:',
			name: 'url',
			validate: requiredValidate,
			filter: function( val ) {
				val = val.replace( /\/+$/g, '' );
				if ( !/^http[s]?:\/\//.test( val ) ) {
					val = 'http://' + val;
				}
				return val;
			}
		}, {
			message: 'Would you like to setup Git?',
			name: 'git',
			type: 'confirm'
		}, {
			message: 'Where will the git repo be hosted?',
			name: 'gitSrc',
			type: 'list',
			choices: [ 'BitBucket', 'GitHub' ],
			default: 'BitBucket',
			when: function( res ) {
				return !!res.git;
			}
		}, {
			message: 'Git account username:',
			name: 'gitUser',
			validate: requiredValidate,
			when: function( res ) {
				return !!res.git;
			}
		}, {
			message: 'Git repo:',
			name: 'gitRepo',
			validate: requiredValidate,
			when: function( res ) {
				return !!res.git;
			}
		}, {
			message: 'Database host:',
			name: 'dbHost',
			default: 'localhost',
			validate: requiredValidate
		}, {
			message: 'Database name:',
			name: 'dbName',
			validate: requiredValidate
		}, {
			message: 'Database user:',
			name: 'dbUser',
			default: 'root',
			validate: requiredValidate
		}, {
			message: 'Database password:',
			name: 'dbPass',
			default: 'root',
			validate: requiredValidate
		}, {
			message: 'Database table prefix:',
			name: 'tablePrefix',
			default: 'wp_',
			validate: requiredValidate
		}, {
			message: 'Would you like to install a custom theme or use the default Mattbase Framework?',
			name: 'themeType',
			type: 'list',
			choices: [ 'Mattbase Framework', 'Install from GitHub', 'Install from zip file' ],
			default: 'Mattbase Framework'
		}, {
			message: 'Theme directory name:',
			name: 'themeDir',
			validate: requiredValidate,
			filter: function( val ) {
				return val.toLowerCase();
			},
			when: function( res ) {
				return res.themeType === 'Mattbase Framework';
			}
		}, {
			message: 'GitHub username:',
			name: 'githubUser',
			default: 'roots',
			validate: requiredValidate,
			when: function( res ) {
				return res.themeType === 'Install from GitHub';
			}
		}, {
			message: 'GitHub repository name:',
			name: 'githubRepo',
			default: 'sage',
			validate: requiredValidate,
			when: function( res ) {
				return res.themeType === 'Install from GitHub';
			}
		}, {
			message: 'GitHub repository branch:',
			name: 'githubBranch',
			default: 'master',
			validate: requiredValidate,
			when: function( res ) {
				return res.themeType === 'Install from GitHub';
			}
		}, {
			message: 'URL to the theme zip file:',
			name: 'zipUrl',
			default: 'https://downloads.wordpress.org/theme/twentyfifteen.1.0.zip',
			validate: requiredValidate,
			when: function( res ) {
				return res.themeType === 'Install from zip file';
			}
		}, {
			type: 'checkbox',
			name: 'pluginsList',
			message: 'Which plugins would you like to install?',
			choices: [ {
				name: 'Admin Menu Editor',
				value: 'adminMenuEditor',
				checked: true
			}, {
				name: 'Advanced Custom Fields',
				value: 'ACFplugin',
				checked: true
			}, {
				name: 'Gravity Forms',
				value: 'gravityForms',
				checked: true
			}, {
				name: 'Nested Pages',
				value: 'nestedPages',
				checked: true
			}, {
				name: 'WordPress SEO',
				value: 'wordpressSEO',
				checked: true
			} ]
		}, {
			message: 'Does this all look correct?',
			name: 'confirm',
			type: 'confirm'
		} ];

		me.prompt( prompts, function( props ) {
			me.siteName = props.siteName;
			me.url = props.url;
			me.git = props.git;
			me.gitSrc = props.gitSrc;
			me.gitUser = props.gitUser;
			me.gitRepo = props.gitRepo;
			me.dbHost = props.dbHost;
			me.dbName = props.dbName;
			me.dbUser = props.dbUser;
			me.dbPass = props.dbPass;
			me.tablePrefix = props.tablePrefix;
			me.themeType = props.themeType;
			me.themeDir = props.themeDir;
			me.githubUser = props.githubUser;
			me.githubRepo = props.githubRepo;
			me.githubBranch = props.githubBranch;
			me.zipUrl = props.zipUrl;
			me.pluginsList = props.pluginsList;
			me.confirm = props.confirm;

			if ( me.confirm ) {
				done();
			} else {
				getInput();
			}
		}.bind( me ) );
	} // getInput

	getInput();
};

mattbase.prototype.downloadWordPress = function() {
	var done = this.async();

	this.log( '' );
	this.log( chalk.green( 'Downloading the latest version of WordPress...' ) );
	this.extract( 'http://wordpress.org/latest.zip', '.', done );
};

mattbase.prototype.moveWordPress = function() {
	shell.exec( 'mv wordpress/* .' );
	shell.rm( '-rf', 'wordpress' );
};

mattbase.prototype.removeDefaultStuff = function() {
	this.log( chalk.green( 'Removing default WordPress themes and plugins...' ) );
	shell.rm( '-rf', 'wp-content/themes/twenty*' );
	shell.rm( '-rf', 'wp-content/plugins/hello.php' );
	shell.rm( '-rf', 'wp-content/plugins/akismet/' );
};

mattbase.prototype.installTheme = function() {
	var done = this.async(),
		me = this;

	// MATTBASE
	if ( this.themeType === 'Mattbase Framework' ) {

		this.log( chalk.green( 'Installing Mattbase Framework...' ) );

		this.remote( 'mattbob', 'mattbase', 'master', function( err, remote ) {
			if ( err ) {
				return done( err );
			}

			remote.directory( '.', 'wp-content/themes/' + me.themeDir + '/' );

			done();
		}, true );

		// GITHUB
	} else if ( this.themeType === 'Install from GitHub' ) {

		this.log( chalk.green( 'Installing https://github.com/' + this.githubUser + '/' + this.githubRepo + '...' ) );

		this.remote( me.githubUser, me.githubRepo, me.githubBranch, function( err, remote ) {
			if ( err ) {
				return done( err );
			}

			remote.directory( '.', 'wp-content/themes/' + me.githubRepo + '/' );

			done();
		}, true );

		// ZIP FILE
	} else if ( this.themeType === 'Install from zip file' ) {

		this.log( chalk.green( 'Installing WordPress theme from zip file...' ) );

		this.extract( this.zipUrl, 'wp-content/themes/', done );

	}
};

mattbase.prototype.getLatestJquery = function() {
	if ( this.themeType === 'Mattbase Framework' ) {
		var done = this.async();

		this.log( chalk.green( 'Grabbing latest version of jQuery...' ) );
		this.fetch( 'https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js', 'wp-content/themes/' + this.themeDir + '/assets/js/', done );
	}
};

mattbase.prototype.getLatestNormalize = function() {
	if ( this.themeType === 'Mattbase Framework' ) {
		var done = this.async();

		this.log( chalk.green( 'Grabbing latest version of Normalize.css...' ) );
		this.fetch( 'https://raw.githubusercontent.com/necolas/normalize.css/master/normalize.css', 'wp-content/themes/' + this.themeDir + '/assets/css/', done );
	}
};

mattbase.prototype.adminMenuEditor = function() {
	var plugins = this.pluginsList;

	if ( plugins.indexOf( 'adminMenuEditor' ) > -1 ) {
		var done = this.async();

		this.log( chalk.green( 'Installing Admin Menu Editor plugin...' ) );
		this.extract( 'https://github.com/wp-plugins/admin-menu-editor/archive/master.tar.gz', 'wp-content/plugins', done );
	}
};

mattbase.prototype.ACFplugin = function() {
	var plugins = this.pluginsList;

	if ( plugins.indexOf( 'ACFplugin' ) > -1 ) {
		var done = this.async();

		this.log( chalk.green( 'Installing Advanced Custom Fields plugin...' ) );
		this.extract( 'https://github.com/elliotcondon/acf/archive/master.tar.gz', 'wp-content/plugins', done );
	}
};

mattbase.prototype.gravityForms = function() {
	var plugins = this.pluginsList;

	if ( plugins.indexOf( 'gravityForms' ) > -1 ) {
		var done = this.async();

		this.log( chalk.green( 'Installing Gravity Forms plugin...' ) );
		this.extract( 'https://github.com/gravityforms/gravityforms/archive/master.tar.gz', 'wp-content/plugins', done );
	}
};

mattbase.prototype.nestedPages = function() {
	var plugins = this.pluginsList;

	if ( plugins.indexOf( 'nestedPages' ) > -1 ) {
		var done = this.async();

		this.log( chalk.green( 'Installing Nested Pages plugin...' ) );
		this.extract( 'https://github.com/wp-plugins/wp-nested-pages/archive/master.tar.gz', 'wp-content/plugins', done );
	}
};

mattbase.prototype.wordpressSEO = function() {
	var plugins = this.pluginsList;

	if ( plugins.indexOf( 'wordpressSEO' ) > -1 ) {
		var done = this.async();

		this.log( chalk.green( 'Installing WordPress SEO plugin...' ) );
		this.extract( 'https://github.com/Yoast/wordpress-seo/archive/master.tar.gz', 'wp-content/plugins', done );
	}
};

mattbase.prototype.cleanUpPlugins = function() {
	var plugins = this.pluginsList;

	if ( plugins.indexOf( 'adminMenuEditor' ) > -1 ) {
		shell.exec( 'mv wp-content/plugins/admin-menu-editor-master wp-content/plugins/admin-menu-editor' );
	}

	if ( plugins.indexOf( 'ACFplugin' ) > -1 ) {
		shell.exec( 'mv wp-content/plugins/acf-master wp-content/plugins/advanced-custom-fields' );
	}

	if ( plugins.indexOf( 'gravityForms' ) > -1 ) {
		shell.exec( 'mv wp-content/plugins/gravityforms-master wp-content/plugins/gravityforms' );
	}

	if ( plugins.indexOf( 'nestedPages' ) > -1 ) {
		shell.exec( 'mv wp-content/plugins/wp-nested-pages-master wp-content/plugins/wp-nested-pages' );
	}

	if ( plugins.indexOf( 'wordpressSEO' ) > -1 ) {
		shell.exec( 'mv wp-content/plugins/wordpress-seo-master wp-content/plugins/wordpress-seo' );
	}
}

mattbase.prototype.finalSetupChanges = function() {
	var done = this.async(),
		me = this;

	this.log( chalk.green( 'Almost done...' ) );

	function getSaltKeys( callback ) {
		var ee = new EventEmitter(),
			keys = '';

		https.get( "https://api.wordpress.org/secret-key/1.1/salt/", function( res ) {
			res.on( 'data', function( d ) {
				keys += d.toString();
			} ).on( 'end', function() {
				ee.emit( 'end', keys );
			} );
		} );

		if ( typeof callback === 'function' ) {
			ee.on( 'end', callback );
		}

		return ee;
	}

	getSaltKeys( function( saltKeys ) {
		me.saltKeys = saltKeys;
		me.template( 'wp-config.php.tmpl', 'wp-config.php' );
	} );

	this.template( 'local-config.php.tmpl', 'local-config.php' );

	if ( this.themeType === 'Mattbase Framework' ) {
		this.directory( 'mu-plugins', 'wp-content/mu-plugins' );
		this.directory( 'themes/mattbase/assets', 'wp-content/themes/' + this.themeDir + '/assets' );

		this.template( 'themes/mattbase/functions.php', 'wp-content/themes/' + this.themeDir + '/functions.php' );
		this.template( 'themes/mattbase/style.css', 'wp-content/themes/' + this.themeDir + '/style.css' );
		this.template( 'themes/mattbase/inc/scripts.php', 'wp-content/themes/' + this.themeDir + '/inc/scripts.php' );

		this.copy( 'themes/mattbase/footer.php', 'wp-content/themes/' + this.themeDir + '/footer.php' );
		this.copy( 'themes/mattbase/header.php', 'wp-content/themes/' + this.themeDir + '/header.php' );
		this.copy( 'themes/mattbase/index.php', 'wp-content/themes/' + this.themeDir + '/index.php' );
	}

	done();
};

mattbase.prototype.gitSetup = function() {
	if ( this.git === true ) {
		var done = this.async(),
			me = this,
			repo;

		if ( this.gitSrc === 'BitBucket' ) {
			repo = 'https://bitbucket.org/' + this.gitUser + '/' + this.gitRepo + '.git';
		} else if ( this.gitSrc === 'GitHub' ) {
			repo = 'https://github.com/' + this.gitUser + '/' + this.gitRepo + '.git';
		}

		this.log( chalk.green( 'Setting up git repo...' ) );

		git.init( function( err ) {
			if ( err ) {
				me.log( chalk.red( err ) );
			}

			git.add( './*' ).addRemote( 'origin', repo ).commit( 'Initial Commit - Installed WordPress using the Mattbase Generator', function( err, d ) {
				if ( err ) {
					me.log( chalk.red( err ) );
				}

				me.log( chalk.green( 'Initial commit completed successfully!' ) );
			} );
		} );

		done();
	}
};


module.exports = mattbase;