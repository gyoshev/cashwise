'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    cashwise: {
      app: 'app'
    },

    watch: {
      js: {
        files: ['<%= cashwise.app %>/scripts/{,*/}*.js'],
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= cashwise.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= cashwise.app %>/images/{,*/}*'
        ]
      }
    },

    connect: {
      options: {
        port: 9000,
        livereload: 35729,
        // Change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= cashwise.app %>'
          ]
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= cashwise.app %>/scripts/{,*/}*.js',
        '!<%= cashwise.app %>/scripts/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    }

  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', []);

  grunt.registerTask('default', [
    'newer:jshint',
    'build'
  ]);

};
