module.exports = function(grunt) {
    grunt.initConfig({
        copy: {
            main: {
                files: [
                    // makes all src relative to cwd
                    {expand: true, cwd: './node_modules/jquery/dist', src: 'jquery.min.js', dest: 'public/js/jquery'},
                    {expand: true, cwd: './node_modules/bootstrap/dist/js', src: 'bootstrap.min.js', dest: 'public/js/bootstrap'},

                    {expand: true, cwd: './node_modules/bootstrap-datepicker/dist/js', src: 'bootstrap-datepicker.min.js', dest: 'public/js/bootstrap'},
                    {expand: true, cwd: './node_modules/bootstrap-datepicker/dist/locales', src: 'bootstrap-datepicker.ru.min.js', dest: 'public/js/bootstrap'},
                    //{expand: true, cwd: './node_modules/bootstrap-progressbar', src: 'bootstrap-progressbar.min.js', dest: 'public/js/bootstrap'},

                    {expand: true, cwd: './node_modules/daterangepicker', src: 'daterangepicker-bs3.min.css', dest: 'public/css/daterangepicker'},
                    {expand: true, cwd: './node_modules/daterangepicker', src: 'daterangepicker.min.js', dest: 'public/js/daterangepicker'},

                    {expand: true, cwd: './node_modules/bootstrap/dist/css', src: 'bootstrap.min.css', dest: 'public/css/bootstrap'},
                    {expand: true, cwd: './node_modules/bootstrap/dist/css', src: 'bootstrap-theme.min.css', dest: 'public/css/bootstrap'},
                    {expand: true, cwd: './node_modules/bootswatch/slate', src: ['bootstrap.min.css'], dest: 'public/css/bootstrap/themes/slate'},
                    {expand: true, cwd: './node_modules/bootswatch/cyborg', src: ['bootstrap.min.css'], dest: 'public/css/bootstrap/themes/cyborg'},
                    {expand: true, cwd: './node_modules/bootswatch/readable', src: ['bootstrap.min.css'], dest: 'public/css/bootstrap/themes/readable'},
                    {expand: true, cwd: './node_modules/bootstrap-datepicker/dist/css', src: 'bootstrap-datepicker.min.css', dest: 'public/css/bootstrap'},

                    {expand: true, cwd: './node_modules/highcharts', src: 'highcharts.js', dest: 'public/js/highcharts'},
                    {expand: true, cwd: './node_modules/highcharts', src: 'highcharts-3d.js', dest: 'public/js/highcharts'},
                    {expand: true, cwd: './node_modules/moment/min', src: 'moment.min.js', dest: 'public/js/moment'},

                    {expand: true, cwd: './bower_components/jtable/lib', src: 'jquery.jtable.min.js', dest: 'public/js/jtable'},
                    {expand: true, cwd: './bower_components/jtable/lib/themes/basic', src: 'jtable_basic.min.css', dest: 'public/css/jtable/themes/basic'},
                    {expand: true, cwd: './bower_components/jtable/lib/themes/basic', src: ['*.png'], dest: 'public/css/jtable/themes/basic'},
                    {expand: true, cwd: './bower_components/jtable/lib/themes/metro/darkgray', src: 'jtable.min.css', dest: 'public/css/jtable/themes/metro/darkgrey'},
                    {expand: true, cwd: './bower_components/jtable/lib/themes/metro/darkgray', src: ['*.gif'], dest: 'public/css/jtable/themes/metro/darkgray'},
                    {expand: true, cwd: './bower_components/jtable/lib/themes/metro', src: ['*.png'], dest: 'public/css/jtable/themes/metro'},

                    {expand: true, cwd: './bower_components/datatables.net/js', src: 'jquery.dataTables.min.js', dest: 'public/js/datatable'},
                    {expand: true, cwd: './bower_components/datatables.net-bs/js', src: 'dataTables.bootstrap.min.js', dest: 'public/js/datatable'},
                    {expand: true, cwd: './bower_components/datatables.net-buttons-bs/js', src: 'buttons.bootstrap.min.js', dest: 'public/js/datatable'},
                    {expand: true, cwd: './bower_components/datatables.net-buttons/js', src: ['*.min.js'], dest: 'public/js/datatable'},

                    {expand: true, cwd: './bower_components/datatables.net-bs/css', src: 'dataTables.bootstrap.min.css', dest: 'public/css/bootstrap/datatable'},
                    {expand: true, cwd: './bower_components/datatables.net-buttons-bs/css', src: 'buttons.bootstrap.min.css', dest: 'public/css/bootstrap/datatable'},
                    {expand: true, cwd: './bower_components/datatables.net-buttons-dt/css', src: 'buttons.dataTables.min.css', dest: 'public/css/bootstrap/datatable'},

                    {expand: true, cwd: './bower_components/jquery-ui', src: 'jquery-ui.min.js', dest: 'public/js/jquery'},
                    {expand: true, cwd: './bower_components/jquery-ui/themes/base', src: 'jquery-ui.min.css', dest: 'public/css/jquery-ui/themes/base'},
                    {expand: true, cwd: './bower_components/jquery-ui/themes/base/images', src: ['**'], dest: 'public/css/jquery-ui/themes/base/images'},
                    {expand: true, cwd: './bower_components/jquery-ui/themes/vader', src: 'jquery-ui.min.css', dest: 'public/css/jquery-ui/themes/vader'},
                    {expand: true, cwd: './bower_components/jquery-ui/themes/vader/images', src: ['**'], dest: 'public/css/jquery-ui/themes/vader/images'},

                    {expand: true, cwd: './node_modules/font-awesome/css', src: 'font-awesome.min.css', dest: 'public/css'},
                    {expand: true, cwd: './node_modules/font-awesome/fonts', src: ['**'], dest: 'public/fonts'},
                    {expand: true, cwd: './node_modules/bootstrap/dist/fonts', src: ['**'], dest: 'public/css/fonts'},
                    {expand: true, cwd: './node_modules/bootstrap/dist/fonts', src: ['**'], dest: 'public/css/bootstrap/themes/fonts'},

                    {expand: true, cwd: './node_modules/bootstrap-submenu/dist/js', src: 'bootstrap-submenu.min.js', dest: 'public/js/bootstrap/'},
                    {expand: true, cwd: './node_modules/bootstrap-submenu/dist/css', src: 'bootstrap-submenu.min.css', dest: 'public/css/bootstrap/'},

                    {expand: true, cwd: './node_modules/bootbox', src: 'bootbox.min.js', dest: 'public/js/dialogs/'},
                    {expand: true, cwd: './bower_components/jszip/dist', src: 'jszip.min.js', dest: 'public/js/tools/'},
                ],
            },
            release: {
                files: [
                    {expand: true, src: ['js/**'], dest: 'release'},
                    {expand: true, src: ['css/**'], dest: 'release'},
                    {expand: true, src: ['ajax/**'], dest: 'release'},
                    {expand: true, src: ['fonts/**'], dest: 'release'},
                    {expand: true, src: 'readme.txt', dest: 'release'},

                ]
            }
        },
        exec: {
            test_icecast_parsing: {
                command: 'mocha ./node_modules/icecast-log-parser/test/test.js',
                stdout: true,
            },
        },
        clean: ["./public/js", "./public/css", "./public/fonts", "release", "downloads"],

        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: './source/css',
                    src: ['*.css', '!*.min.css'],
                    dest: './public/css',
                    ext: '.min.css'
                }]
            }
        },

        uglify: {
            src: {
                files: {
                    './public/js/main.min.js': ['./source/js/main.js'],
                    './public/js/app/report/aqh.min.js': ['./source/js/report/aqh.js'],
                    './public/js/app/report/tsl.min.js': ['./source/js/report/tsl.js'],
                    './public/js/app/listeners/when/start.min.js': ['./source/js/listeners/when/start.js'],
                    './public/js/app/listeners/when/stop.min.js': ['./source/js/listeners/when/stop.js'],
                    './public/js/app/listeners/current.min.js': ['./source/js/listeners/current.js'],
                    './public/js/app/listeners/peak.min.js': ['./source/js/listeners/peak.js'],
                    './public/js/app/listeners/same.min.js': ['./source/js/listeners/same.js'],
                    './public/js/app/listeners/uniq.min.js': ['./source/js/listeners/uniq.js'],
                    './public/js/app/listeners/map/country.min.js': ['./source/js/listeners/map/country.js'],
                    './public/js/app/listeners/map/city.min.js': ['./source/js/listeners/map/city.js'],
                    './public/js/app/other/durations.min.js': ['./source/js/other/durations.js'],
                    './public/js/app/other/referers.min.js': ['./source/js/other/referers.js'],
                    './public/js/app/other/user_agents.min.js': ['./source/js/other/user_agents.js'],
                    './public/js/app/other/songs_ratio.min.js': ['./source/js/other/songs_ratio.js'],
                    './public/js/app/admin/stations.min.js': ['./source/js/admin/stations.js'],
                    './public/js/app/admin/mounts.min.js': ['./source/js/admin/mounts.js'],
                    './public/js/app/admin/users.min.js': ['./source/js/admin/users.js'],
                    './public/js/app/admin/permissions.min.js': ['./source/js/admin/permissions.js'],
                    './public/js/app/user/settings.min.js': ['./source/js/user/settings.js']
                }
            },
            other: {
                files: {
                    './public/js/jquery/jquery-form.min.js': ['./node_modules/jquery-form/jquery.form.js'],
                    './public/js/highcharts/themes/dark-unica.min.js': ['./node_modules/highcharts/themes/dark-unica.js'],
                    './public/js/highcharts/themes/grid-light.min.js': ['./node_modules/highcharts/themes/grid-light.js'],
                    './public/js/highcharts/themes/skies.min.js': ['./node_modules/highcharts/themes/skies.js'],
                    './public/js/highcharts/themes/sand-signika.min.js': ['./node_modules/highcharts/themes/sand-signika.js']
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            css: {
                files: ['./source/css/**/*.css'],
                tasks: ['cssmin']
            },
            scripts: {
                files: [
                    './source/js/*.js',
                    './source/js/listeners/*.js',
                    './source/js/listeners/when/*.js',
                    './source/js/listeners/map/*.js',
                    './source/js/other/*.js',
                    './source/js/admin/*.js',
                    './source/js/user/*.js',
                    './source/js/report/*.js'
                ],
                tasks: ['uglify:src']
            },
        },

        nodemon: {
            src: {
                options: {
                    file: 'app.js',
                    args: ['development'],
                    nodeArgs: ['--debug'],
                    ignoredFiles: ['*.md', 'node_modules/**'],
                    watchedExtensions: ['js', 'ejs', 'css'],
                    watchedFolders: ['./source/**', './routes/**', './views/**'],
                    delayTime: 1,
                    env: {
                        PORT: '3001'
                    },
                    cwd: __dirname
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
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('default', ['clean', 'copy:main', 'uglify', 'cssmin', 'concurrent:dev']);
    grunt.registerTask('release', ['clean', 'copy', 'uglify', 'cssmin', 'copy:release']);
    grunt.registerTask('test', ['exec:test_icecast_parsing']);
};
