module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        folders: {
            // configurable paths
            src: 'client',
            tmp: '.tmp',
            dist: 'client-build'
        },
        less: {
            dist: {
                files: {
                    '<%=folders.tmp%>/styles/application.css': '<%=folders.src%>/styles/application.less'
                }
            }
        },
        watch: {
            less: {
                files: ['<%=folders.src%>/styles/**/*.*'],
                tasks: ['less', 'autoprefixer']
            },
            livereload: {
                options: {
                    livereload: 35729,
                    nospawn: true
                },
                files: [
                    '<%= folders.tmp %>/**/*.*',
                    '<%= folders.src %>/views/**/*.html',
                    '<%= folders.src %>/scripts/**/*.js',
                    '<%= folders.src %>/*.ejs'
                ]
            }
        },
        nodemon: {
            dev: {
                script: 'index.js',
                options: {
                    env: {
                        ENVIRONMENT: 'development'
                    },
                    ignore: ['client/*', '.tmp/*'],
                    callback: function (nodemon) {
                        nodemon.on('log', function (event) {
                            console.log(event.colour);
                        });
                    }
                }
            }
        },
        concurrent: {
            dev: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        autoprefixer: {
            options: ['last 2 versions'],
            dist: {
                files: [{
                    src: '<%=folders.tmp%>/styles/application.css',
                    dest: '<%=folders.tmp%>/styles/application.css'
                }]
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%=folders.dist%>'
                    ]
                }]
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= folders.dist %>/scripts/scripts.js',
                        '<%= folders.dist %>/scripts/libs.js',
                        '<%= folders.dist %>/styles/{,*/}*.css'
                    ]
                }
            }
        },
        useminPrepare: {
            html: '<%=folders.src%>/index.ejs',
            options: {
                root: '<%= folders.src %>',
                dest: '<%= folders.dist %>',
                flow: {
                    steps: { 'js': ['concat', 'uglifyjs'], 'css': ['concat', 'cssmin']},
                    post: {
                        js: [{
                            name: 'uglify',
                            createConfig: function(context) {
                                // Enable mangle for libs, but disable for app
                                // since there is no easy way to mangle angularjs app correctly
                                var options = context.options.generated;

                                options.files.forEach(function(filesConfig) {
                                    var name = require('path').basename(filesConfig.dest);
                                    context.options[name] = {
                                        files: [filesConfig],
                                        options: {
                                            mangle: filesConfig.dest.match(/libs\.js/) ? true : false
                                        }
                                    };
                                });

                                // We remove files from 'generated' task since we moved them to another task
                                context.options.generated.files.length = 0;
                            }
                        }]
                    }
                }
            }
        },
        usemin: {
            html: ['<%= folders.dist %>/index.ejs'],
            css: ['<%= folders.dist %>/styles/{,*/}*.css'],
            options: {
                assetsDirs: ['<%= folders.dist %>']
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%=folders.src%>/',
                        src: '*.ejs',
                        dest: '<%= folders.dist %>/'
                    },
                    {
                        expand: true,
                        cwd: '<%=folders.src%>/bower_components/bootstrap/fonts',
                        src: '*.*',
                        dest: '<%= folders.dist %>/fonts'
                    },
                    {
                        src: '<%=folders.src%>/bower_components/zeroclipboard/dist/ZeroClipboard.swf',
                        dest: '<%= folders.dist %>/bower_components/zeroclipboard/dist/ZeroClipboard.swf'
                    },
                    {
                        src: '<%=folders.src%>/favicon.ico',
                        dest: '<%= folders.dist %>/favicon.ico'
                    },
                    {
                        expand: true,
                        cwd: '<%=folders.src%>/views/',
                        src: '**/*.*',
                        dest: '<%= folders.dist %>/views/'
                    },
                    {
                        expand: true,
                        cwd: '<%=folders.src%>/images/',
                        src: '**/*.*',
                        dest: '<%= folders.dist %>/images/'
                    }
                ]
            }
        }
    });

    var buildTasks = [
        'clean:dist',
        'less',
        'autoprefixer',
        'useminPrepare',
        'concat',
        'uglify',
        'cssmin',
        'copy:dist',
        'rev',
        'usemin'
    ];
    grunt.registerTask('build', buildTasks);

    grunt.registerTask('serve', ['less', 'concurrent:dev']);

};
