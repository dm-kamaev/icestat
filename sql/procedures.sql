--- peak idea

  SET @TARGET_DATE_POINT = '2016-01-04 00:10:00';

  SET @total = 0;
  SELECT count(*) INTO @total FROM (
    SELECT FROM_UNIXTIME(UNIX_TIMESTAMP(date) - duration) AS start_date, date as end_date
    FROM `2016-01-04` WHERE mount='/blackstarradio128.mp3' HAVING @TARGET_DATE_POINT BETWEEN start_date AND end_date
  ) results;

--- peak procedure

DELIMITER $$

DROP PROCEDURE IF EXISTS GetPeakListeners$$

CREATE PROCEDURE GetPeakListeners(
        IN RANGE_START DATETIME,
        IN RANGE_END DATETIME,
        IN RANGE_STEP CHAR(10),
        IN DB_NAME CHAR(120),
        IN TABLE_NAME CHAR(64),
        IN MOUNT CHAR(255))

BEGIN

DROP TEMPORARY TABLE IF EXISTS temp_peak_listeners;

SET @columns = 'FROM_UNIXTIME(UNIX_TIMESTAMP(date) - duration) AS start_date, date AS end_date';
SET @where = CONCAT(' WHERE mount= ''', MOUNT, '''');
SET @sort = ' ORDER BY start_date ASC';
SET @temp = 'CREATE TEMPORARY TABLE IF NOT EXISTS temp_peak_listeners AS ( ';
SET @query = CONCAT(@temp, 'SELECT ', @columns, ' FROM ', '`', DB_NAME, '`.`', TABLE_NAME,'`', @where, @sort, ')');

PREPARE statement FROM @query;
EXECUTE statement;
DEALLOCATE PREPARE statement;

DROP TABLE IF EXISTS result_peak_listeners;
CREATE TEMPORARY TABLE result_peak_listeners (step_date DATETIME, total INTEGER) ENGINE=MEMORY;

SET @TARGET_DATE = RANGE_START;

REPEAT
  SET @TOTAL = 0;

  call GetTotalPeakFromDateTimeRange(RANGE_START, RANGE_END, @TARGET_DATE, DB_NAME, TABLE_NAME, MOUNT, @TOTAL);

  INSERT INTO result_peak_listeners VALUES (@TARGET_DATE, @TOTAL);

  SELECT ADDTIME(@TARGET_DATE, RANGE_STEP) INTO @TARGET_DATE;
UNTIL UNIX_TIMESTAMP(@TARGET_DATE) >= UNIX_TIMESTAMP(RANGE_END) END REPEAT;

SELECT * FROM result_peak_listeners;

DROP TEMPORARY TABLE IF EXISTS temp_peak_listeners;
DROP TEMPORARY TABLE IF EXISTS result_peak_listeners;

END$$

DELIMITER ;

---

DELIMITER $$

DROP PROCEDURE IF EXISTS GetTotalPeakFromDateTimeRange$$
CREATE PROCEDURE GetTotalPeakFromDateTimeRange(
        IN RANGE_START DATETIME,
        IN RANGE_END DATETIME,
        IN TARGET_DATE DATETIME,
        IN DB_NAME CHAR(120),
        IN TABLE_NAME CHAR(64),
        IN MOUNT CHAR(255),
        OUT TOTAL INTEGER)

BEGIN

SELECT count(*) INTO TOTAL FROM (
    SELECT * FROM temp_peak_listeners HAVING TARGET_DATE BETWEEN start_date AND end_date
) results;

END$$

DELIMITER ;

--- same time idea

SET @MOUNT = '/blackstarradio128.mp3';
SET @RANGE_START = '2016-01-04 00:00:00';
SET @RANGE_END = '2016-01-04 00:10:00';

SET total = 0;
SELECT total := count(*) FROM (
    SELECT IsOverlapDates(ranges.start_date, ranges.end_date, @RANGE_START, @RANGE_END) as overlap FROM (
           SELECT id, FROM_UNIXTIME( UNIX_TIMESTAMP( DATE ) - duration ) AS start_date, DATE AS end_date
                FROM  `2016-01-04`
                WHERE mount = @MOUNT
    ) ranges ORDER BY ranges.start_date ASC
) results WHERE results.overlap = true;


--- same time

DELIMITER $$

DROP PROCEDURE IF EXISTS GetSameTimeListeners$$

CREATE PROCEDURE GetSameTimeListeners(
        IN RANGE_START DATETIME,
        IN RANGE_END DATETIME,
        IN RANGE_STEP CHAR(10),
        IN DB_NAME CHAR(120),
        IN TABLE_NAME CHAR(64),
        IN MOUNT CHAR(255))

BEGIN

DROP TEMPORARY TABLE IF EXISTS temp_table_for_get_date_ranges_total;

SET @columns = 'FROM_UNIXTIME(UNIX_TIMESTAMP(date) - duration) AS start_date, date AS end_date';
SET @where = CONCAT(' WHERE mount= ''', MOUNT, '''');
SET @sort = ' ORDER BY start_date ASC';
SET @temp = 'CREATE TEMPORARY TABLE IF NOT EXISTS temp_table_for_get_date_ranges_total AS ( ';
SET @query = CONCAT(@temp, 'SELECT ', @columns, ' FROM ', '`', DB_NAME, '`.`', TABLE_NAME,'`', @where, @sort, ')');

PREPARE statement FROM @query;
EXECUTE statement;
DEALLOCATE PREPARE statement;

DROP TABLE IF EXISTS result_table_for_get_date_ranges_total;
CREATE TEMPORARY TABLE result_table_for_get_date_ranges_total (start_date DATETIME, end_date DATETIME, total INTEGER) ENGINE=MEMORY;

REPEAT
  SET @TOTAL = 0;
  SELECT ADDTIME(RANGE_START, RANGE_STEP) INTO @STEP_END;
  call GetTotalFromDateTimeRange(RANGE_START, @STEP_END, DB_NAME, TABLE_NAME, MOUNT, @TOTAL);

  INSERT INTO result_table_for_get_date_ranges_total VALUES (RANGE_START, @STEP_END, @TOTAL);

  SELECT ADDTIME(RANGE_START, RANGE_STEP) INTO RANGE_START;
UNTIL UNIX_TIMESTAMP(@STEP_END) >= UNIX_TIMESTAMP(RANGE_END) END REPEAT;

SELECT * FROM result_table_for_get_date_ranges_total;

DROP TEMPORARY TABLE IF EXISTS temp_table_for_get_date_ranges_total;
DROP TEMPORARY TABLE IF EXISTS result_table_for_get_date_ranges_total;

END$$

DELIMITER ;

---

DELIMITER $$

DROP PROCEDURE IF EXISTS GetTotalFromDateTimeRange$$
CREATE PROCEDURE GetTotalFromDateTimeRange(
        IN RANGE_START DATETIME,
        IN RANGE_END DATETIME,
        IN DB_NAME CHAR(120),
        IN TABLE_NAME CHAR(64),
        IN MOUNT CHAR(255),
        OUT TOTAL INTEGER)

BEGIN

SET @where = CONCAT(' WHERE IsOverlapDates(start_date, end_date, ''', RANGE_START, ''', ''', RANGE_END,''') = True');
SET @query = CONCAT('SELECT COUNT(*) INTO @total FROM temp_table_for_get_date_ranges_total', @where);

PREPARE statement FROM @query;
EXECUTE statement;
SET TOTAL=@total;
DEALLOCATE PREPARE statement;

END$$

DELIMITER ;

