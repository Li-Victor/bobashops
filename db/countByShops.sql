SELECT COUNT(*) AS COUNT, storeid
FROM log
GROUP BY log.storeid;
