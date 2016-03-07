var mysql = require('mysql');
var config = require('config');
var db = config.get('db');

var connection = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.password,
    connectTimeout: db.timeout * 1000
}),

dropsql = "DROP TABLE IF EXISTS `" + db.admin_db + "`.`" + db.stations_table + "`";

sql = "CREATE TABLE `" + db.admin_db + "`.`" + db.stations_table + "` (\n" +
     " `id` int(12) NOT NULL AUTO_INCREMENT,\n" +
     " `name` varchar(255) NOT NULL,\n" +
     " `url` varchar(255) NOT NULL,\n" +
     " `ftp_host` varchar(255) NOT NULL,\n" +
     " `ftp_username` varchar(255) NOT NULL,\n" +
     " `ftp_password` varchar(255) NOT NULL,\n" +
     " `update_db` tinyint(1) NOT NULL,\n" +
     " PRIMARY KEY (`id`)\n" +
     ") ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=0 ";

connection.query(dropsql);
connection.query(sql);

console.log('Success: Stations Table Created!');

connection.end();
