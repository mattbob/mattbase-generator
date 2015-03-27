module.exports = function(grunt) {

	grunt.initConfig({
        jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'app/index.js'
			]
		},

		watch: {
			options: {
			    dateFormat: function(time) {
			        grunt.log.writeln('Finished in ' + time + 'ms');
			        grunt.log.writeln('Waiting...');
			        grunt.log.writeln('');
			    }
			},
			js: {
				files: [
					'<%= jshint.all %>'
				],
				tasks: ['jshint']
			}
		}
	});

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Register tasks
	grunt.registerTask('default', [
		'jshint'
	]);

};