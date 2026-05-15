-- AlterTable
ALTER TABLE `audit_logs` MODIFY `entity` ENUM('USER', 'COMPLAINT', 'AUDIT_LOG', 'DASHBOARD') NULL;
