-- AlterTable
ALTER TABLE `login_attempts` ADD COLUMN `deviceInfo` JSON NULL,
    ADD COLUMN `failureReason` VARCHAR(191) NULL,
    ADD COLUMN `userAgent` VARCHAR(191) NULL;
