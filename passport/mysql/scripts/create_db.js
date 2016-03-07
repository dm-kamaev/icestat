var mysql = require('mysql');
var config = require('config');
var dbconfig = config.get('db');

var connection = mysql.createConnection({
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    connectTimeout: dbconfig.timeout * 1000
});

connection.query('DROP DATABASE IF EXISTS ' + dbconfig.admin_db);

connection.query('CREATE DATABASE ' + dbconfig.admin_db);

connection.query("CREATE TABLE `" + dbconfig.admin_db + "`.`" + dbconfig.users_table + "` ( " +
    "`id` INT UNSIGNED NOT NULL AUTO_INCREMENT, " +
    "`username` VARCHAR(20) NOT NULL, " +
    "`password` CHAR(60) NOT NULL, " +
    "`email` VARCHAR(150) NOT NULL, " +
    "`admin` tinyint(1) NOT NULL DEFAULT 0, " +
    "`theme` CHAR(20) DEFAULT 'default', " +
    "`mounts_multiselect` tinyint(1) NOT NULL DEFAULT 0, " +
    "    PRIMARY KEY (`id`), " +
    "UNIQUE INDEX `id_UNIQUE` (`id` ASC), " +
    "UNIQUE INDEX `username_UNIQUE` (`username` ASC))");

console.log('Success: Users Database Created!');

connection.end();
