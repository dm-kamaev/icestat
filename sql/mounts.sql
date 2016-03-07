-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Дек 23 2015 г., 16:35
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
-- Структура таблицы `mounts`
--

CREATE TABLE IF NOT EXISTS `mounts` (
  `id` int(12) NOT NULL AUTO_INCREMENT,
  `station_id` int(12) NOT NULL,
  `name` varchar(255) NOT NULL,
  `mount` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;
