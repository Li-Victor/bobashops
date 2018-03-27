SELECT COUNT(*) AS COUNT, bobaid
FROM log
GROUP BY log.bobaid;
