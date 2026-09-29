-- Runs once, while the reading-tracker-mysql-data volume is empty (/docker-entrypoint-initdb.d).
-- The entrypoint has already created the reading_tracker database (MYSQL_DATABASE) and the reading user (MYSQL_USER).

-- Database for integration tests (DATABASE_URL_TEST)
CREATE DATABASE IF NOT EXISTS reading_tracker_test
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Shadow DB for `prisma migrate dev` (SHADOW_DATABASE_URL)
CREATE DATABASE IF NOT EXISTS reading_tracker_shadow
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- The reading user has privileges only on the 3 databases of this project
GRANT ALL PRIVILEGES ON reading_tracker.* TO 'reading'@'%';
GRANT ALL PRIVILEGES ON reading_tracker_test.* TO 'reading'@'%';
GRANT ALL PRIVILEGES ON reading_tracker_shadow.* TO 'reading'@'%';
FLUSH PRIVILEGES;
