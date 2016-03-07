DELIMITER $$

DROP FUNCTION IF EXISTS `IsOverlapDates`$$

CREATE FUNCTION `IsOverlapDates`(
            startDate1 DATETIME,
            endDate1 DATETIME,
            startDate2 DATETIME,
            endDate2 DATETIME
        ) RETURNS TINYINT(1)
    DETERMINISTIC
BEGIN
    DECLARE Overlap TINYINT DEFAULT 0;

    SET Overlap = (SELECT CASE WHEN
                    (startDate1 BETWEEN startDate2 AND endDate2) OR -- for inner and end date outer
                    (endDate1 BETWEEN startDate2 AND endDate2) OR -- for inner and start date outer
                    (startDate2 BETWEEN startDate1 AND endDate1) -- only one needed for outer range where dates are inside.
               THEN 1 ELSE 0 END);
    RETURN Overlap;
END$$

DELIMITER ;
