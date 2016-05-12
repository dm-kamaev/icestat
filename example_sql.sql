-- узнать список возможных потоков у данного радио
SELECT COUNT(*), mount FROM `stations_radiovera.hostingradio.ru`.`2016-03-04` GROUP BY mount
+------------+-------------------+
|   count(*) | mount             |
|------------+-------------------|
|       1344 | /radiovera64.aacp |
|      14193 | /radiovera_128    |
|        627 | /radiovera_32     |
|       5849 | /radiovera_64     |
+------------+-------------------+
4 rows in set


use stations_dorognoe.hostingradio.ru;
stations_dorognoe.hostingradio.ru> SELECT * FROM `2016-03-09` LIMIT 2 \G
***************************[ 1. row ]***************************
id         | 1
ip         | 2.102.10.81
date       | 2016-03-09 23:56:01
country    | GB
city       | Manchester
lat        | 53.5
lon        | -2.2167
method     | GET
mount      | /radio
protocol   | HTTP/1.1
referer    |
sent_bytes | 192447
duration   | 7
status     | 200
agent      | Lavf/56.40.101
***************************[ 2. row ]***************************
id         | 2
ip         | 79.126.3.230
date       | 2016-03-09 23:56:02
country    | RU
city       | Nizhniy Novgorod
lat        | 56.32867
lon        | 44.00205
method     | GET
mount      | /dorognoe
protocol   | HTTP/1.1
referer    |
sent_bytes | 655777
duration   | 74
status     | 200
agent      | SonyEricssonWT19i Build/4.0.2.A.0.58 stagefright/1.1 (Linux;Android 2.3.4)


use playlist_dorognoe.hostingradio.ru;
playlist_dorognoe.hostingradio.ru> SELECT * FROM `2016-03-09` LIMIT 2 \G
***************************[ 1. row ]***************************
id    | 1
date  | 2016-03-09 00:00:23
mount | /dorognoewithoutadvertising
count | 4
meta  | АЛЕКСАНДР СЕРОВ МУЗЫКА ВЕНЧАЛЬНАЯ
***************************[ 2. row ]***************************
id    | 2
date  | 2016-03-09 00:00:24
mount | /radio
count | 286
meta  | АЛЕКСАНДР СЕРОВ МУЗЫКА ВЕНЧАЛЬНАЯ


SELECT * FROM `2016-03-09` WHERE meta="АЛЕКСАНДР СЕРОВ МУЗЫКА ВЕНЧАЛЬНАЯ" \G
***************************[ 1. row ]***************************
id    | 1
date  | 2016-03-09 00:00:23
mount | /dorognoewithoutadvertising
count | 4
meta  | АЛЕКСАНДР СЕРОВ МУЗЫКА ВЕНЧАЛЬНАЯ
***************************[ 2. row ]***************************
id    | 2
date  | 2016-03-09 00:00:24
mount | /radio
count | 286
meta  | АЛЕКСАНДР СЕРОВ МУЗЫКА ВЕНЧАЛЬНАЯ
***************************[ 3. row ]***************************
id    | 3
date  | 2016-03-09 00:00:24
mount | /dorognoe_acc
count | 30
meta  | АЛЕКСАНДР СЕРОВ МУЗЫКА ВЕНЧАЛЬНАЯ
***************************[ 4. row ]***************************
id    | 4
date  | 2016-03-09 00:00:24
mount | /dorognoe
count | 366
meta  | АЛЕКСАНДР СЕРОВ МУЗЫКА ВЕНЧАЛЬНАЯ
***************************[ 5. row ]***************************
id    | 5
date  | 2016-03-09 00:00:25
mount | /dor_64_no
count | 460
meta  | АЛЕКСАНДР СЕРОВ МУЗЫКА ВЕНЧАЛЬНАЯ


use playlist_blackstarradio.hostingradio.ru;
SELECT * FROM `2016-03-15` WHERE mount='/blackstarradio128.mp3' \G;

use stations_blackstarradio.hostingradio.ru;
SELECT * FROM `2016-03-15` WHERE date='2016-03-15 07:47:30' AND mount='/blackstarradio128.mp3' \G

SELECT UNIX_TIMESTAMP(date) as end_listen_s, mount, duration FROM `stations_dorognoe.hostingradio.ru`.`2016-03-09` WHERE mount='/dor_64_no' ORDER BY start_listen_s ASC \G
SELECT  COUNT(*) FROM `stations_dorognoe.hostingradio.ru`.`2016-03-09` WHERE mount='/dor_64_no' GROUP BY \G


-------- TIME SPENT LISTENING
-- суммарное время
SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, SUM(duration) as totalSeconds FROM `2016-03-22` WHERE mount='/dor_64_no'
+------------+----------------+
| date       | totalSeconds   |
|------------+----------------|
| 2016-03-22 | 182985125      |
+------------+----------------+

-- слушатели, которые больше суток слушают
SELECT date, duration FROM `2016-03-22` WHERE mount='/dor_64_no' AND duration>=86400
+---------------------+------------+
| date                |   duration |
|---------------------+------------|
| 2016-03-22 12:07:44 |     106104 |
| 2016-03-22 14:13:37 |     452064 |
| 2016-03-22 06:28:40 |     350189 |
| 2016-03-22 07:40:56 |      87673 |
| 2016-03-22 05:44:34 |     101609 |
| 2016-03-22 16:08:17 |     372249 |
| 2016-03-22 14:45:55 |      96379 |
+---------------------+------------+

--  кол-во слушателей в сутках
SELECT COUNT(*) FROM `2016-03-22` WHERE mount='/dor_64_no'
SELECT COUNT(*) FROM `chameleon-dorognoe-aachq`.`2016-04-03` WHERE mount='/dorognoe64.aacp'
+------------+
|   COUNT(*) |
|------------|
|      47807 |
+------------+
-- расчет среднего времени прослушанивая радио на одного  пользователя
-- 182985125/47807 = 3827,5801661 с / 60 = 63,793002768 мин


-- радио vera
use stations_radiovera.hostingradio.ru;
-- суммарное время
SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, SUM(duration) as totalSeconds FROM `2016-03-07` WHERE mount='/radiovera64.aacp'
+------------+----------------+
| date       | totalSeconds   |
|------------+----------------|
| 2016-03-07 | 6443851990     |
+------------+----------------+

-- кол-во пользователей
SELECT COUNT(*) FROM `2016-03-07` WHERE mount='/radiovera64.aacp'
+------------+
|   COUNT(*) |
|------------|
|       1178 |
+------------+
-- расчет среднего времени на пользователя
-- 6443851990/1178 = 5470162,9796 с / 60 = 91169,382993 мин = 1519,4897166 ч

-- пользователи, которые слушают большу суток
SELECT date, duration FROM `2016-03-07` WHERE mount='/radiovera64.aacp' AND duration>=86400
+---------------------+------------+
| date                |   duration |
|---------------------+------------|
| 2016-03-07 15:04:30 | 2147483647 |
| 2016-03-07 20:43:42 | 2147483647 |
| 2016-03-07 20:46:22 | 2147483647 |
+---------------------+------------+
-- SELECT date, duration FROM `stations_dorognoe.hostingradio.ru`.`2016-03-07` WHERE mount='/dor_64_no' AND duration>=86400

-- прикидываем сколько будет, если вычесть все лишнее
6443851990-3*2147483647 = 1401049/1178 = 1189,3455008 с / 60 = 19,822425013 мин

-- все пользователи, которые начали слушать в прошлых сутках
SELECT date, duration FROM `2016-03-07` WHERE mount='/radiovera64.aacp' AND UNIX_TIMESTAMP(date)-duration<UNIX_TIMESTAMP('2016-03-07') AND duration<=172800


--  суммарное время всех пользователей у которых время прослушивания меньше 2 суток
stations_radiovera.hostingradio.ru> SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, SUM(duration) as totalSeconds FROM `2016-03-07` WHERE mount='/radiovera64.aacp' AND duration<=172800
+------------+----------------+
| date       | totalSeconds   |
|------------+----------------|
| 2016-03-07 | 1401049        |
+------------+----------------+
1401049/1178 = 1189,3455008 с / 60 = 19,822425013


-- –––––––––––––––––––––––––––––––––––––––––––––––––––––– Unique

SELECT COUNT(*) FROM `2016-03-27` WHERE mount='/dor_64_no' GROUP BY mount

-- Показать все потоки для радио
stations_dorognoe.hostingradio.ru> SELECT mount, COUNT(*) FROM `2016-03-27` GROUP BY mount;
+--------------------------------------+------------+
| mount                                |   COUNT(*) |
|--------------------------------------+------------|
| /dorognoe                            |      42259 |
| /dorognoe.smi                        |          1 |
| /dorognoe1945.mp3                    |       1994 |
| /dorognoewithoutadvertising          |         30 |
| /dorognoe_acc                        |       2385 |
| /dor_64_no                           |      33563 |
| /player/css                          |          2 |
| /player/script                       |          1 |
| /radio                               |      48771 |
| /style.css                           |          1 |
| http://dorognoe.hostingradio.ru:8000 |          1 |
+--------------------------------------+------------+

-- Показать радио по url
-- по id можно найти потоки в таблице mounts для этого радио
icestat_management> SELECT * FROM  stations WHERE url="http://dorognoe.hostingradio.ru:8000/status_stream.xsl" \G
***************************[ 1. row ]***************************
id           | 223
name         | Дорожное
url          | http://dorognoe.hostingradio.ru:8000/status_stream.xsl
ftp_host     | dorognoe.hostingradio.ru/log
ftp_username | dorognoe
ftp_password | dorognoe11==
update_db    | 1









-- –––––––––––––––––––––––––––––––––––––––––––––––––––––– ICESTAT MANAGMENT

-- список включенных станций у пользователя test2
SELECT * FROM permissions WHERE user_id=10 \G
-- user_id это id пользователя в таблице users
-- mount_id это id радио с потоком в таблице mounts
***************************[ 1. row ]***************************
id       | 313
user_id  | 10
mount_id | 2
selected | 1
***************************[ 2. row ]***************************
id       | 314
user_id  | 10
mount_id | 20
selected | 1

icestat_management> SELECT * FROM mounts WHERE id=2 \G
***************************[ 1. row ]***************************
id         | 2
station_id | 223
name       | Дорожное 64 (без рекламы)
mount      | /dor_64_no

-- поискать радио по потоку
icestat_management> SELECT * FROM mounts WHERE mount="/radiovera64.aacp"  \G
***************************[ 1. row ]***************************
id         | 261
station_id | 22
name       | radiovera-64aac
mount      | /radiovera64.aacp

-- добавить пользователю test2 возможность смотреть радио radiovera-64aac
INSERT INTO permissions SET user_id=10, mount_id=261, selected=1;
-- удалить у пользвателя радио
!DELETE FROM permissions WHERE user_id=10 AND mount_id=261 AND selected=0;


-- поискать радио по имени
icestat_management> SELECT * FROM mounts WHERE name="chameleon-dorognoe-mp3hq"  \G
***************************[ 1. row ]***************************
id         | 23
station_id | 198
name       | chameleon-dorognoe-mp3hq
mount      | /dorognoe128.mp3

-- добавить пользователю test2 возможность смотреть радио chameleon-dorognoe-mp3hq
INSERT INTO permissions SET user_id=10, mount_id=23, selected=1;

-- поискать радио по имени
icestat_management> SELECT * FROM mounts WHERE name="chameleon-dorognoe-aachq"  \G
***************************[ 1. row ]***************************
id         | 24
station_id | 198
name       | chameleon-dorognoe-aachq
mount      | /dorognoe64.aacp

-- добавить пользователю test2 возможность смотреть радио chameleon-dorognoe-mp3hq
INSERT INTO permissions SET user_id=10, mount_id=24, selected=1;

-- поискать потоки по названию
icestat_management> SELECT * FROM mounts WHERE name LIKE 'emg-europaplus%'
+------+--------------+--------------------------------+----------------------+
|   id |   station_id | name                           | mount                |
|------+--------------+--------------------------------+----------------------|
|  235 |           65 | emg-europaplus-256mp3          | /europaplus256.mp3   |
|  236 |          106 | emg-europaplus-128mp3          | /ep128               |
|  237 |           36 | emg-europaplusTOP40-128mp3     | /eptop128            |
|  238 |          184 | emg-europaplusLight-128mp3     | /ep-light128.mp3     |



INSERT INTO permissions SET user_id=10, mount_id=235, selected=0;
INSERT INTO permissions SET user_id=10, mount_id=236, selected=0;
INSERT INTO permissions SET user_id=10, mount_id=237, selected=0;
INSERT INTO permissions SET user_id=10, mount_id=238, selected=0;
INSERT INTO permissions SET user_id=10, mount_id=239, selected=0;
INSERT INTO permissions SET user_id=10, mount_id=240, selected=0;
INSERT INTO permissions SET user_id=10, mount_id=241, selected=0;
INSERT INTO permissions SET user_id=10, mount_id=242, selected=0;
INSERT INTO permissions SET user_id=10, mount_id=243, selected=0;
INSERT INTO permissions SET user_id=10, mount_id=244, selected=0;
INSERT INTO permissions SET user_id=10, mount_id=245, selected=0;
INSERT INTO permissions SET user_id=10, mount_id=246, selected=0;


-- ALTER TABLE `2016-02-24` ADD INDEX id (id);
-- ALTER TABLE `table` DROP INDEX `index_name`;
ALTER TABLE `2016-04-22` ADD INDEX mount_date (mount, date);