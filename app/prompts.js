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
			message: 'WordPress URL:',
			name: 'url',
			default: defaults.url || null,
			validate: requiredValidate,
			filter: function(value) {
				value = value.replace(/\/+$/g, '');
				if (!/^http[s]?:\/\//.test(value)) {
					value = 'http://' + value;
				}
				return value;
			}
		}, {
			message: 'WordPress Version:',
			name: 'wpVer',
			default: defaults.wpVer || null,
			validate: requiredValidate,
			when: advancedWhen,
		}, {
			message: 'Table prefix:',
			name: 'tablePrefix',
			default: defaults.tablePrefix || 'wp_',
			validate: requiredValidate
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
			message: 'Use Git?',
			name: 'git',
			default: defaults.git || 'N',
			type: 'confirm'
		}, {
			message: 'Install a custom theme?',
			name: 'installTheme',
			type: 'confirm',
			default: (typeof defaults.installTheme !== 'undefined') ? defaults.installTheme : true
		}, {
			message: 'Theme directory name:',
			name: 'themeDir',
			default: defaults.themeDir || 'mattbase',
			validate: requiredValidate,
			when: function(res) {
				return !!res.installTheme;
			}
		}, {
			message: 'Theme source type (git/tar):',
			name: 'themeType',
			default: defaults.themeType || 'git',
			validate: function(value) {
				if (value != '' && /^(?:git|tar)$/.test(value)) {
					return true;
				}
				return false;
			},
			when: function(res) {
				return !!res.installTheme;
			}
		}, {
			message: 'GitHub username:',
			name: 'themeUser',
			default: defaults.themeUser || 'mattbob',
			validate: requiredValidate,
			when: function(res) {
				return !!res.installTheme && res.themeType == 'git';
			}
		}, {
			message: 'GitHub repository name:',
			name: 'themeRepo',
			default: defaults.themeRepo || 'mattbase',
			validate: requiredValidate,
			when: function(res) {
				return !!res.installTheme && res.themeType == 'git';
			}
		}, {
			message: 'Repository branch:',
			name: 'themeBranch',
			default: defaults.themeBranch || 'master',
			validate: requiredValidate,
			when: function(res) {
				return !!res.installTheme && res.themeType == 'git';
			}
		}, {
			message: 'Remote tarball url:',
			name: 'themeTarballUrl',
			default: defaults.themeTarballUrl || 'https://github.com/mattbob/mattbase/tarball/master',
			validate: requiredValidate,
			when: function(res) {
				return !!res.installTheme && res.themeType == 'tar';
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
		    name: 'Gravity Forms',
		      value: 'gravityForms',
		      checked: true
		    }, {
		      name: 'Simple Page Ordering',
		      value: 'simplePageOrdering',
		      checked: true
		    }, {
		      name: 'Helpful Information',
		      value: 'helpfulInformation',
		      checked: true
		    }]
		}
	];
};
