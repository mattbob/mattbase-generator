module.exports = function(advanced, defaults) {

	// Validate required
	var requiredValidate = function(value) {
		if (value == '') {
			return 'This field is required.';
		}
		return true;
	};

	// When advanced
	var advancedWhen = function() {
		return advanced;
	};

	return [
		{
			message: 'Site URL:',
			name: 'url',
			default: defaults.url || null,
			validate: requiredValidate,
			filter: function(val) {
				val = val.replace(/\/+$/g, '');
				if (!/^http[s]?:\/\//.test(val)) {
					val = 'http://' + val;
				}
				return val;
			}
		}, {
			message: 'Database host:',
			name: 'dbHost',
			default: defaults.dbHost || 'localhost',
			validate: requiredValidate
		}, {
			message: 'Database name:',
			name: 'dbName',
			default: defaults.dbName || null,
			validate: requiredValidate
		}, {
			message: 'Database user:',
			name: 'dbUser',
			default: defaults.dbUser || null,
			validate: requiredValidate
		}, {
			message: 'Database password:',
			name: 'dbPass',
			default: defaults.dbPass || null
		}, {
			message: 'Database table prefix:',
			name: 'tablePrefix',
			default: defaults.tablePrefix || 'wp_',
			validate: requiredValidate
		}, {
			message: 'Would you like to setup Git?',
			name: 'git',
			type: 'confirm'
		}, {
			message: 'Would you like to install a custom theme?',
			name: 'installTheme',
			type: 'confirm'
		}, {
			message: 'Theme directory name:',
			name: 'themeDir',
			default: defaults.themeDir || 'mattbase',
			validate: requiredValidate,
			filter: function(val) {
				return val.toLowerCase();
			},
			when: function(res) {
				return !!res.installTheme;
			}
		}, {
			message: 'Install the theme from GitHub or a zip file?',
			name: 'themeType',
			type: 'list',
			choices: [ 'GitHub', 'Zip File' ],
			default: defaults.themeType || 'GitHub',
			when: function(res) {
				return !!res.installTheme;
			}
		}, {
			message: 'GitHub username:',
			name: 'themeUser',
			default: defaults.themeUser || 'mattbob',
			validate: requiredValidate,
			when: function(res) {
				return !!res.installTheme && res.themeType == 'GitHub';
			}
		}, {
			message: 'GitHub repository name:',
			name: 'themeRepo',
			default: defaults.themeRepo || 'mattbase',
			validate: requiredValidate,
			when: function(res) {
				return !!res.installTheme && res.themeType == 'GitHub';
			}
		}, {
			message: 'GitHub repository branch:',
			name: 'themeBranch',
			default: defaults.themeBranch || 'master',
			validate: requiredValidate,
			when: function(res) {
				return !!res.installTheme && res.themeType == 'GitHub';
			}
		}, {
			message: 'URL to the theme zip file:',
			name: 'themeTarballUrl',
			default: defaults.themeTarballUrl || 'https://wordpress.org/themes/download/twentyfourteen.1.0.zip',
			validate: requiredValidate,
			when: function(res) {
				return !!res.installTheme && res.themeType == 'Zip File';
			}
		}, {
		    type: 'checkbox',
		    name: 'pluginsList',
		    message: 'Which plugins would you like to install?',
		    choices: [{
		      name: 'Admin Menu Editor',
		      value: 'adminMenuEditor',
		      checked: true
		    }, {
		      name: 'Advanced Custom Fields',
		      value: 'ACFplugin',
		      checked: true
		    }, {
		      name: 'Google Sitemap Generator',
		      value: 'googleSitemapGenerator',
		      checked: true
		    }, {
		      name: 'Gravity Forms',
		      value: 'gravityForms',
		      checked: true
		    }, {
		      name: 'Helpful Information',
		      value: 'helpfulInformation',
		      checked: true
		    }, {
		      name: 'Simple Page Ordering',
		      value: 'simplePageOrdering',
		      checked: true
		    }, {
		      name: 'WordPress SEO',
		      value: 'wordpressSEO',
		      checked: true
		    }]
		}
	];
};