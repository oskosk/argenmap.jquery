module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    buildDir: 'dist',
    uglify: {
      options: {
        banner: [
          '/*!',
          ' * <%= pkg.name %> v1',
          ' * ',
          ' * Version     : <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)',
          ' * Licencia    : <%= pkg.license.url %>',
          ' * Web site    : http://ign.gob.ar/argenmap',          
          ' * Repositorio : http://github.com/oskosk/argenmap.jquery',
          ' * Issues      : https://github.com/oskosk/argenmap.jquery/issues',
          ' * Contacto    : argenmap@ign.gob.ar',
          ' * ',
          ' * Instituto Geografico Nacional de Argentina',
          ' * Todos los derechos reservados.',
          ' *',
          ' */\n\n'
        ].join('\n'),        
      },
      build: {
        options: {
          'preserveComments':'some'
        },
        src: 'src/<%= pkg.name %>.js',
        dest: '<%= buildDir %>/<%= pkg.name %>.min.js' 
      },
      build2: {
        options: {
          'mangle': false,
          'preserveComments': false,
	        'compress': false,
          'beautify': true
        },
        files: {
          '<%= buildDir %>/<%= pkg.name %>.js': [ 'src/<%= pkg.name %>.js'],
        }
      }
    }  
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default Task(s).
  grunt.registerTask('default', ['uglify']);
};
