var mysql = require('mysql');
var config = require('config');
var db = config.get('db');

var connection = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.password,
    connectTimeout: db.timeout * 1000
}),

usesql = "USE `" + db.admin_db + "`;";
dropsql = "DROP TABLE IF EXISTS `" + db.admin_db + "`.`" + db.mounts_table + "`;";

sql = "CREATE TABLE `" + db.admin_db + "`.`" + db.mounts_table + "` (\n" +
     " `id` int(12) NOT NULL AUTO_INCREMENT,\n" +
     " `station_id` int(12) NOT NULL,\n" +
     " `name` varchar(255) NOT NULL,\n" +
     " PRIMARY KEY (`id`),\n" +
     " KEY `station_id` (`station_id`),\n" +
     " FOREIGN KEY (`station_id`) REFERENCES `" + db.admin_db + "`.`" + db.mounts_table + "` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION \n" +
     ") ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=UTF8_GENERAL_CI AUTO_INCREMENT=0";

connection.query(usesql);
connection.query(dropsql);
connection.query(sql);

console.log('Success: Mounts Table Created!');

connection.end();
