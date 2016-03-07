-- function for AQH (Average Quarter Hour) report

DELIMITER $$

DROP FUNCTION IF EXISTS `IsOverlapAQHDates`$$

CREATE FUNCTION `IsOverlapAQHDates`(
            startDate1 DATETIME,
            endDate1 DATETIME,
            startDate2 DATETIME,
            endDate2 DATETIME
        ) RETURNS TINYINT(1)
    DETERMINISTIC
BEGIN
    DECLARE Overlap TINYINT DEFAULT 0;

    SET Overlap = IsOverlapDates(startDate1, endDate1, startDate2, endDate2);
    IF Overlap = 1 THEN
        SET Overlap = (SELECT CASE WHEN
            (TIMEDIFF(endDate2, startDate1) < '00:05:00') OR
            (TIMEDIFF(endDate2, endDate1) > '00:05:00')
            THEN 0 ELSE 1 END);
    END IF;
    RETURN Overlap;
END$$

DELIMITER ;

-- AQH Procedure

DELIMITER $$

DROP PROCEDURE IF EXISTS GetAQHListeners$$

CREATE PROCEDURE GetAQHListeners(
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
  call GetAQHTotalFromDateTimeRange(RANGE_START, @STEP_END, @TOTAL);

  INSERT INTO result_table_for_get_date_ranges_total VALUES (RANGE_START, @STEP_END, @TOTAL);

  SELECT ADDTIME(RANGE_START, RANGE_STEP) INTO RANGE_START;
UNTIL UNIX_TIMESTAMP(@STEP_END) >= UNIX_TIMESTAMP(RANGE_END) END REPEAT;

SELECT * FROM result_table_for_get_date_ranges_total;

DROP TEMPORARY TABLE IF EXISTS temp_table_for_get_date_ranges_total;
DROP TEMPORARY TABLE IF EXISTS result_table_for_get_date_ranges_total;

END$$

DELIMITER ;

--- AQH Total
DELIMITER $$

DROP PROCEDURE IF EXISTS GetAQHTotalFromDateTimeRange$$
CREATE PROCEDURE GetAQHTotalFromDateTimeRange(
        IN RANGE_START DATETIME,
        IN RANGE_END DATETIME,
        OUT TOTAL INTEGER)

BEGIN

SELECT COUNT(*) INTO @total FROM temp_table_for_get_date_ranges_total WHERE IsOverlapAQHDates(start_date, end_date, RANGE_START, RANGE_END) = True;

SET TOTAL=@total;

END$$

DELIMITER ;

