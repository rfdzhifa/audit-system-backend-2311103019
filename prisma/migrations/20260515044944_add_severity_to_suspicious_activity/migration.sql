-- AlterTable
ALTER TABLE `suspicious_activities` ADD COLUMN `severity` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM';
