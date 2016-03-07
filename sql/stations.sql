-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Дек 23 2015 г., 14:42
-- Версия сервера: 5.5.44-0ubuntu0.14.04.1
-- Версия PHP: 5.5.9-1ubuntu4.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- База данных: `icestat_management`
--

-- --------------------------------------------------------

--
-- Структура таблицы `stations`
--

CREATE TABLE IF NOT EXISTS `stations` (
  `id` int(12) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `ftp_host` varchar(255) NOT NULL,
  `ftp_username` varchar(255) NOT NULL,
  `ftp_password` varchar(255) NOT NULL,
  `update_db` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=219 ;

--
-- Дамп данных таблицы `stations`
--

INSERT INTO `stations` (`id`, `name`, `url`, `ftp_host`, `ftp_username`, `ftp_password`, `update_db`) VALUES
(9, 'Радио ', 'http://dorognoe.hostingradio.ru:8000/status_stream.xsl', 'dorognoe.hostingradio.ru/log', 'dorognoe', 'dorognoe11==', 1),
(11, 'Дисней', 'http://disney.hostingradio.ru:8015/status_stream.xsl', 'disney.hostingradio.ru/log', 'disney', 'disney11==', 1),
(13, 'БФМ', 'http://bfm.hostingradio.ru:8004/status_stream.xsl', 'bfm.hostingradio.ru/log', 'bfm', 'bfm11==', 1),
(14, 'Бубукин', 'http://panel.radio-box.org:8005/status_stream.xsl', 'panel.radio-box.org/log', 'bubukin', 'bubukin11==', 1),
(21, 'Пионер', 'http://pioner.hostingradio.ru:8008/status_stream.xsl', 'pioner.hostingradio.ru/log', 'pioner', 'pioner11==', 1),
(22, 'Вера', 'http://radiovera.hostingradio.ru:8007/status_stream.xsl', 'radiovera.hostingradio.ru/log', 'radiovera', 'radiovera11==', 1),
(23, 'Choco', 'http://choco.hostingradio.ru:10010/status_stream.xsl', 'choco.hostingradio.ru/log', 'choco', 'choco11==', 1),
(24, 'Связной', 'http://svyaznoy.hostingradio.ru:8010/status_stream.xsl', 'svyaznoy.hostingradio.ru/log', 'svyaznoy', 'svyaznoy11==', 1),
(172, 'ВДВ', 'http://vdvradio.hostingradio.ru:8001/status_stream.xsl', 'vdvradio.hostingradio.ru/log', 'vdvradio', 'vdvradio11==', 1),
(26, 'Европа +', 'http://europaplus.hostingradio.ru:8014/status_stream.xsl', 'europaplus.hostingradio.ru/log', 'europaplus', 'europaplus11==', 1),
(212, 'Столица', 'http://stolicafm.hostingradio.ru:8038/status_stream.xsl', 'stolicafm.hostingradio.ru/log', 'stolicafm', 'stolicafm11==', 1),
(30, 'Гарь', 'http://gar.hostingradio.ru:8016/status_stream.xsl', 'gar.hostingradio.ru/log', 'gar', 'gar11==', 1),
(33, 'Европа + 128', 'http://ep128server.streamr.ru:8030/status_stream.xsl', 'ep128server.streamr.ru/log', 'ep128', 'europaplus11==', 1),
(34, 'Европа + 64', 'http://ep64server.streamr.ru:8031/status_stream.xsl', 'ep64server.streamr.ru/log', 'ep64', 'europaplus11==', 1),
(35, 'Европа + 32', 'http://ep32server.streamr.ru:8032/status_stream.xsl', 'ep32server.streamr.ru/log', 'ep32', 'europaplus11==', 1),
(36, 'Топ Европа + 128', 'http://eptop128server.streamr.ru:8033/status_stream.xsl', 'eptop128server.streamr.ru/log', 'eptop128', 'europaplus11==', 1),
(37, 'Топ Европа Фреш + 128', 'http://epfresh128server.streamr.ru:8034/status_stream.xsl', 'epfresh128server.streamr.ru/log', 'epfresh128', 'europaplus11==', 1),
(38, 'Топ Европа Дэнс + 128', 'http://epdance128server.streamr.ru:8035/status_stream.xsl', 'epdance128server.streamr.ru/log', 'epdance128', 'europaplus11==', 1),
(40, 'Радио 7', 'http://radio7server.streamr.ru:80/status_stream.xsl', 'radio7server.streamr.ru/log', 'radio7', 'radio711==', 1),
(41, 'Ретро 32', 'http://retroserver.streamr.ru:8043/status_stream.xsl', 'retroserver.streamr.ru/log', 'retro', 'retro11==', 1),
(43, 'Команда', 'http://komandaserver.streamr.ru:8051/status_stream.xsl', 'komandaserver.streamr.ru/log', 'komanda', 'komanda11==', 1),
(215, 'Дом', 'http://radiodom.hostingradio.ru:8013/status_stream.xsl', 'radiodom.hostingradio.ru/log', 'radiodom', 'radiodom11==', 1),
(47, 'Дисней 2', 'http://disney2.streamr.ru:8060/status_stream.xsl', 'disney2.streamr.ru/log', 'disney2', 'disney11==', 1),
(48, 'СпортФМ', 'http://sportfm.hostingradio.ru:8050/status_stream.xsl', 'sportfm.hostingradio.ru/log', 'sportfm', 'sportfm11==', 1),
(50, 'РНБ 128', 'http://eprnb128server.streamr.ru:8061/status_stream.xsl', 'eprnb128server.streamr.ru/log', 'eprnb128', 'eprnb12811==', 1),
(51, 'РОК 128', 'http://eprock128server.streamr.ru:8062/status_stream.xsl', 'eprock128server.streamr.ru/log', 'eprock128', 'eprock12811==', 1),
(207, 'Ретро 80-х', 'http://retro80.hostingradio.ru:8026/status_stream.xsl', 'retro80.hostingradio.ru/log', 'retro80', 'retro8011==', 1),
(54, 'МТС', 'http://mtsserver.streamr.ru:8054/status_stream.xsl', 'mtsserver.streamr.ru/log', 'mts', 'mts11==', 1),
(55, 'Дорожное 2', 'http://dor2server.streamr.ru:8000/status_stream.xsl', 'dor2server.streamr.ru/log', 'dorognoe', 'dorognoe11==', 1),
(208, 'Ретро 90-х', 'http://retro90.hostingradio.ru:8027/status_stream.xsl', 'retro90.hostingradio.ru/log', 'retro90', 'retro9011==', 1),
(65, 'Европа2563', 'http://ep256.hostingradio.ru:8052/status_stream.xsl', 'ep256.hostingradio.ru/log', 'ep2563', 'ep256311==', 1),
(59, 'Коммерсант Нижний Новгород', 'http://komernnserver.streamr.ru:8068/status_stream.xsl', 'komernnserver.streamr.ru/log', 'komnn', 'komnn11==', 1),
(68, 'Радио Книга', 'http://litraserver.streamr.ru:8069/status_stream.xsl', 'litraserver.streamr.ru/log', 'litra', 'litra11==', 1),
(82, 'Радио День', 'http://n1.radioday.fm/status_stream.xsl', 'n1.radioday.fm', 'ftpgo', 'drS6z87VwCGX', 1),
(83, 'Радио День', 'http://n2.radioday.fm/status_stream.xsl', 'n2.radioday.fm', 'ftpgo', 'drS6z87VwCGX', 1),
(86, 'FBI', 'http://fbimusic.hostingradio.ru:8013/status_stream.xsl', 'fbimusic.hostingradio.ru/log', 'fbimusic', 'fbimusic11==', 1),
(90, 'Русский хит 2', 'http://ruhit.imgradio.pro/rmimg-box.xsl', '50.7.188.218/access-50.7.190.180-LIVE2-RELAY-RUHIT', 'radiostatistica', 'radiostatisticaimg', 1),
(88, 'Джаз и Классик', 'http://jfm.jazzandclassic.ru:14536/status_stream.xsl', 'jfm.jazzandclassic.ru/log', 'jazz', 'jazz11==', 1),
(89, 'РУССКИЙ ХИТ', 'http://imgradio.pro/rmimg-box.xsl', '50.7.188.218/access-50.7.190.178-LIVE-RELAY', 'radiostatistica', 'radiostatisticaimg', 1),
(91, 'Русский хит 3', 'http://s2.imgradio.pro/rmimg-box.xsl', '50.7.188.218/access-50.7.188.220-LIVE2-RELAY-S2', 'radiostatistica', 'radiostatisticaimg', 1),
(92, 'Русский хит 4', 'http://50.7.188.221/rmimg-box.xsl', '50.7.188.218/access-50.7.188.221-LIVE2-RELAY-S3', 'radiostatistica', 'radiostatisticaimg', 1),
(205, 'Буль-Буль', 'http://bulbul.hostingradio.ru:8057/status_stream.xsl', 'bulbul.hostingradio.ru/log', 'bulbul', 'bulbul11==', 1),
(96, 'Радио день', 'http://n3.radioday.fm/status_stream.xsl', 'n3.radioday.fm', 'ftpgo', 'drS6z87VwCGX', 1),
(101, 'Наше', 'http://nashe1.hostingradio.ru/status_stream.xsl', 'nashe1.hostingradio.ru/log', 'nashe1', 'nashe111==', 1),
(102, 'Наше2', 'http://nashe2.hostingradio.ru/status_stream.xsl', 'nashe2.hostingradio.ru/log', 'nashe2', 'nashe211==', 1),
(103, 'Наше3', 'http://nashe3.hostingradio.ru/status_stream.xsl', 'nashe3.hostingradio.ru/log', 'nashe3', 'nashe311==', 1),
(106, 'ЕП1282', 'http://ep128.hostingradio.ru:8030/status_stream.xsl', 'ep128.hostingradio.ru/log', 'ep1282', 'ep128211==', 1),
(111, 'HRradio', 'http://hrradio.hostingradio.ru:8077/status_stream.xsl', 'hrradio.hostingradio.ru/log', 'hrradio', 'hrradio11==', 1),
(114, 'Черная птица', 'http://blackradio.hostingradio.ru:8078/status_stream.xsl', 'blackradio.hostingradio.ru/log', 'blackradio', 'blackradio11==', 1),
(125, 'Домашнее', 'http://homeradio.hostingradio.ru:8018/status_stream.xsl', 'homeradio.hostingradio.ru/log', 'homeradio', 'homeradio11==', 1),
(179, 'Воис', 'http://voicemaikop.hostingradio.ru:8003/status_stream.xsl', 'voicemaikop.hostingradio.ru/log', 'voicemaikop', 'voicemaikop11==', 1),
(126, 'NEFM', 'http://185.22.64.207:8099/status_stream.xsl', '185.22.64.207', 'icelogs', 'Er390YYBIttR1V6', 1),
(131, 'Кофе', 'http://coffee.hostingradio.ru:8019/status_stream.xsl', 'coffee.hostingradio.ru/log', 'coffee', 'coffee11==', 1),
(132, 'yumfm', 'http://yumfm.hostingradio.ru:8020/status_stream.xsl', 'yumfm.hostingradio.ru/log', 'yam', 'yam11==', 1),
(133, 'mediamarkt', 'http://mediamarkt.hostingradio.ru:8021/status_stream.xsl', 'mediamarkt.hostingradio.ru/log', 'mediamarkt', 'mediamarkt11==', 1),
(206, 'Ретро 70-х', 'http://retro70.hostingradio.ru:8025/status_stream.xsl', 'retro70.hostingradio.ru/log', 'retro70', 'retro7011==', 1),
(137, 'vostokfm', 'http://vostokfm.hostingradio.ru:8028/status_stream.xsl', 'vostokfm.hostingradio.ru/log', 'vostokfm', 'vostokfm11==', 1),
(138, 'радио Ликование', 'http://prostoradio.ru:7777/status_stream.xsl', 'radiolikovanie.ru', 'radio', 'radio946', 1),
(141, 'VesnaFM', 'http://vesnafm.hostingradio.ru:8056/status_stream.xsl', 'vesnafm.hostingradio.ru/log', 'vesnafm', 'vesnafm11==', 1),
(144, 'beelinefm', 'http://beelinefm.hostingradio.ru:8058/status_stream.xsl', 'beelinefm.hostingradio.ru/log', 'beelinefm', 'beelinefm11==', 1),
(151, 'NEFMkcell', 'http://195.47.255.122/status_stream.xsl', '185.22.64.207', 'icecastlogs', 'aidBagostoritya', 1),
(149, 'Радио Бамблби', 'http://live.bumblebeefm.ru:8000/status_stream.xsl', 'live.bumblebeefm.ru', 'stat', 'HJkjh73GT#6*(dfk', 1),
(150, 'DEEP ONE radio', 'http://stream.deep1.ru:8000/status_stream.xsl', 'stream.deep1.ru', 'stat', 'stat659', 1),
(154, 'ocean', 'http://ocean.hostingradio.ru:8059/status_stream.xsl', 'ocean.hostingradio.ru/log', 'ocean', 'ocean11==', 1),
(159, 'radio7port40', 'http://radio7server.streamr.ru:8040/status_stream.xsl', 'radio7server.streamr.ru/log', 'radio7port40', 'radio711==', 1),
(160, 'megapolis', 'http://megapolis.hostingradio.ru:8074/status_stream.xsl', 'megapolis.hostingradio.ru/log', 'megapolis', 'megapolis11==', 1),
(167, 'РП', 'http://rp.hostingradio.ru:8049/status_stream.xsl', 'rp.hostingradio.ru/log', 'rp', 'rp11==', 1),
(168, 'Комерсант', 'http://kommersant77.hostingradio.ru/status_stream.xsl', 'kommersant77.hostingradio.ru/log', 'kommersant77', 'kommersant7711==', 1),
(170, 'yradio', 'http://yuradio.hostingradio.ru:8002/status_stream.xsl', 'yuradio.hostingradio.ru/log', 'yuradio', 'yuradio11==', 1),
(173, 'МиксФМ РадиоДача', 'http://radio.gubernia.com:8000/status_stream.xsl', 'radio.gubernia.com', 'icecast2015', '7bVbTs61WuN653', 1),
(180, 'ПлейФМ', 'http://playfm.hostingradio.ru:8012/status_stream.xsl', 'playfm.hostingradio.ru/log', 'playfm', 'playfm11==', 1),
(182, 'Монте Карло', 'http://185.39.195.90:8000/status_stream.xsl', '185.39.195.90', 'stats', '3359', 1),
(186, 'Блэкстар', 'http://blackstarradio.hostingradio.ru:8024/status_stream.xsl', 'blackstarradio.hostingradio.ru/log', 'blackstarradio', 'blackstarradio11==', 1),
(184, 'ЕМГ СПБ', 'http://emgspb.hostingradio.ru:80/status_stream.xsl', 'emgspb.hostingradio.ru/log', 'emgspb', 'emgspb11==', 1),
(185, 'Хорошее', 'http://62.212.72.162:8000/status_stream.xsl', '62.212.72.162', 'ftplog', 'Galaxy258', 1),
(196, 'Наше 5', 'http://nashe5.hostingradio.ru:8066/status_stream.xsl', 'nashe5.hostingradio.ru/log', 'nashe4', 'nashe411==', 1),
(189, 'КП', 'http://kpradio.hostingradio.ru:8000/status_stream.xsl', 'kpradio.hostingradio.ru/log', 'kpradio', 'kpradio11==', 1),
(198, 'Стартрек', 'http://stream01.chameleon.fm:80/status_stream.xsl', 'stream01.chameleon.fm/log', 'startrek', 'startrek11==', 1),
(193, 'ВГТРК', 'http://vgtrk15.hostingradio.ru:8011/status_stream.xsl', 'vgtrk15.hostingradio.ru/log', 'vgtrk15', 'vgtrk1511==', 1);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
