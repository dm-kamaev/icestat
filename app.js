var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var passport = require('passport');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash    = require('connect-flash');
var captcha = require('captcha');

var routes = require('./routes/index');
var home = require('./routes/home');

var listeners_when_start = require('./routes/listeners/when/start');
var listeners_when_stop = require('./routes/listeners/when/stop');
var current_listeners = require('./routes/listeners/current');
var peak_listeners = require('./routes/listeners/peak');
var same_listeners = require('./routes/listeners/same');
var uniq_listeners = require('./routes/listeners/uniq');
var map_by_country_listeners = require('./routes/listeners/map/country');
var map_by_city_listeners = require('./routes/listeners/map/city');
var durations = require('./routes/other/durations');
var referers = require('./routes/other/referers');
var user_agents = require('./routes/other/user_agents');
var songs_ratio = require('./routes/other/songs_ratio');

var report_aqh = require('./routes/report/aqh');
var report_tsl = require('./routes/report/tsl');

var admin_stations = require('./routes/admin/stations');
var admin_mounts = require('./routes/admin/mounts');
var admin_users = require('./routes/admin/users');
var admin_permissions = require('./routes/admin/permissions');

var user_settings = require('./routes/user/settings');

var api_listeners_when_start = require('./routes/api/listeners/when/start');
var api_listeners_when_stop = require('./routes/api/listeners/when/stop');
var api_current_listeners = require('./routes/api/listeners/current');
var api_peak_listeners = require('./routes/api/listeners/peak');
var api_same_listeners = require('./routes/api/listeners/same');
var api_uniq_listeners = require('./routes/api/listeners/uniq');
var api_map_by_country_listeners = require('./routes/api/listeners/map/country');
var api_map_by_city_listeners = require('./routes/api/listeners/map/city');
var api_durations = require('./routes/api/other/durations');
var api_referers = require('./routes/api/other/referers');
var api_user_agents = require('./routes/api/other/user_agents');
var api_songs_ratio = require('./routes/api/other/songs_ratio');

var api_table_peak_listeners = require('./routes/api/listeners/table/peak');

// МОЕ
var api_peak_listeners_2 = require('./peak_test/peak_listeners.js');

var api_report_aqh = require('./routes/api/report/aqh');
var api_report_tsl = require('./routes/api/report/tsl');

var api_admin_station_list = require('./routes/api/admin/station/list');
var api_admin_station_create = require('./routes/api/admin/station/create');
var api_admin_station_update = require('./routes/api/admin/station/update');
var api_admin_station_delete = require('./routes/api/admin/station/delete');
var api_admin_station_options = require('./routes/api/admin/station/options');

var api_admin_mount_list = require('./routes/api/admin/mount/list');
var api_admin_mount_create = require('./routes/api/admin/mount/create');
var api_admin_mount_update = require('./routes/api/admin/mount/update');
var api_admin_mount_delete = require('./routes/api/admin/mount/delete');
var api_admin_mount_options = require('./routes/api/admin/mount/options');

var api_admin_user_list = require('./routes/api/admin/user/list');
var api_admin_user_create = require('./routes/api/admin/user/create');
var api_admin_user_update = require('./routes/api/admin/user/update');
var api_admin_user_delete = require('./routes/api/admin/user/delete');
var api_admin_user_options = require('./routes/api/admin/user/options');

var api_admin_permission_list = require('./routes/api/admin/permission/list');
var api_admin_permission_create = require('./routes/api/admin/permission/create');
var api_admin_permission_update = require('./routes/api/admin/permission/update');
var api_admin_permission_delete = require('./routes/api/admin/permission/delete');
var api_admin_permission_options = require('./routes/api/admin/permission/options');

var api_user_mount_list = require('./routes/api/user/mount/list');
var api_user_permission_create = require('./routes/api/user/permission/create');
var api_user_permission_list = require('./routes/api/user/permission/list');
var api_user_permission_select = require('./routes/api/user/permission/select');
var api_user_settings_update = require('./routes/api/user/settings/update');
var api_user_settings_theme = require('./routes/api/user/settings/theme');

// passport
require('./passport/mysql/strategy')(passport); // pass passport for configuration

// routes
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Для production проверить работоспособность
if (app.get('env') === 'development') {
  app.use(session({ secret: 're2MoPhieRohoo7ye5ae', resave: true, saveUninitialized: true }));
} else {
  app.use(session({ store: new RedisStore({port: 6379}), secret: 're2MoPhieRohoo7ye5ae', saveUninitialized: true, resave: true }));
}
//app.use(session({ secret: 're2MoPhieRohoo7ye5ae', resave: true, saveUninitialized: true }));
// app.use(session({ store: new RedisStore({port: 6379}), secret: 're2MoPhieRohoo7ye5ae', saveUninitialized: true, resave: true }));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(captcha({ url: '/captcha.jpg', color:'#000000', background: '#EEEEEE' }));

// common routes
app.use('/', routes);
app.use('/home', home);

app.use('/listeners/when/start', listeners_when_start);
app.use('/listeners/when/stop', listeners_when_stop);
app.use('/listeners/current', current_listeners);
app.use('/listeners/peak', peak_listeners);
app.use('/listeners/same', same_listeners);
app.use('/listeners/uniq', uniq_listeners);
app.use('/listeners/map/country', map_by_country_listeners);
app.use('/listeners/map/city', map_by_city_listeners);

app.use('/other/durations', durations);
app.use('/other/referers', referers);
app.use('/other/user_agents', user_agents);
app.use('/other/songs_ratio', songs_ratio);

app.use('/report/aqh', report_aqh);
app.use('/report/tsl', report_tsl);

app.use('/admin/stations', admin_stations);
app.use('/admin/mounts', admin_mounts);
app.use('/admin/users', admin_users);
app.use('/admin/permissions', admin_permissions);

app.use('/user/settings', user_settings);

// api
app.use('/api/listeners/when/start', api_listeners_when_start);
app.use('/api/listeners/when/stop', api_listeners_when_stop);
app.use('/api/listeners/current', api_current_listeners);
app.use('/api/listeners/peak', api_peak_listeners);
app.use('/api/listeners/same', api_same_listeners);
app.use('/api/listeners/uniq', api_uniq_listeners);
app.use('/api/listeners/map/country', api_map_by_country_listeners);
app.use('/api/listeners/map/city', api_map_by_city_listeners);

app.use('/api/listeners/table/peak', api_table_peak_listeners);

// МОЕ
app.use('/api/listeners/peak_all', api_peak_listeners_2);

app.use('/api/report/aqh', api_report_aqh);
app.use('/api/report/tsl', api_report_tsl);

app.use('/api/other/durations', api_durations);
app.use('/api/other/referers', api_referers);
app.use('/api/other/user_agents', api_user_agents);
app.use('/api/other/songs_ratio', api_songs_ratio);

app.use('/api/admin/station/list', api_admin_station_list);
app.use('/api/admin/station/create', api_admin_station_create);
app.use('/api/admin/station/update', api_admin_station_update);
app.use('/api/admin/station/delete', api_admin_station_delete);
app.use('/api/admin/station/options', api_admin_station_options);

app.use('/api/admin/mount/list', api_admin_mount_list);
app.use('/api/admin/mount/create', api_admin_mount_create);
app.use('/api/admin/mount/update', api_admin_mount_update);
app.use('/api/admin/mount/delete', api_admin_mount_delete);
app.use('/api/admin/mount/options', api_admin_mount_options);

app.use('/api/admin/user/list', api_admin_user_list);
app.use('/api/admin/user/create', api_admin_user_create);
app.use('/api/admin/user/update', api_admin_user_update);
app.use('/api/admin/user/delete', api_admin_user_delete);
app.use('/api/admin/user/options', api_admin_user_options);

app.use('/api/admin/permission/list', api_admin_permission_list);
app.use('/api/admin/permission/create', api_admin_permission_create);
app.use('/api/admin/permission/update', api_admin_permission_update);
app.use('/api/admin/permission/delete', api_admin_permission_delete);
app.use('/api/admin/permission/options', api_admin_permission_options);

app.use('/api/user/mount/list', api_user_mount_list);
app.use('/api/user/permission/create', api_user_permission_create);
app.use('/api/user/permission/list', api_user_permission_list);
app.use('/api/user/permission/select', api_user_permission_select);
app.use('/api/user/settings/update', api_user_settings_update);
app.use('/api/user/settings/theme', api_user_settings_theme);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
