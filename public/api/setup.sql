-- Sitakunda Pourashava Land Portal Database Schema
-- Compatible with MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+ on Hostinger
-- Character set utf8mb4 supports Bangla unicode characters properly

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+06:00";

-- --------------------------------------------------------
-- 1. Table structure for applications (Demarcation, Building, Road Cutting)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `applications` (
  `id` VARCHAR(64) NOT NULL,
  `module_type` ENUM('demarcation', 'building', 'road_cutting') NOT NULL DEFAULT 'demarcation',
  `form_no` VARCHAR(64) NULL,
  `tracking_id` VARCHAR(64) NOT NULL,
  `applicant_name` VARCHAR(255) NULL,
  `applicant_phone` VARCHAR(32) NULL,
  `status` VARCHAR(64) NOT NULL DEFAULT 'submitted',
  `data` LONGTEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tracking` (`tracking_id`),
  INDEX `idx_module` (`module_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Table structure for audit logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(64) NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `officer_username` VARCHAR(128) NOT NULL,
  `officer_name` VARCHAR(255) NULL,
  `officer_role` VARCHAR(64) NULL,
  `officer_designation` VARCHAR(255) NULL,
  `action_type` VARCHAR(64) NOT NULL,
  `action_title` VARCHAR(255) NOT NULL,
  `target_id` VARCHAR(64) NULL,
  `applicant_name` VARCHAR(255) NULL,
  `details` TEXT NULL,
  `ip_address` VARCHAR(64) NULL,
  `metadata` LONGTEXT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_officer` (`officer_username`),
  INDEX `idx_target` (`target_id`),
  INDEX `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table structure for officer passwords & credentials
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `officers` (
  `username` VARCHAR(128) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default officer passwords if not exist
INSERT IGNORE INTO `officers` (`username`, `password_hash`, `role`, `title`) VALUES
('admin.sitakunda', 'Admin@Sitakunda2026', 'super_admin', 'পৌর অ্যাডমিনিস্ট্রেটর (System Admin)'),
('draftsman.sitakunda', 'Sitakunda@2026', 'draftsman', 'নক্সাকার (সিভিল)'),
('xen.sitakunda', 'Sitakunda@2026', 'executive_engineer', 'নির্বাহী প্রকৌশলী'),
('mayor.sitakunda', 'Sitakunda@2026', 'mayor', 'মেয়র / প্রশাসক');

-- --------------------------------------------------------
-- 4. Table structure for application drafts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `drafts` (
  `draft_key` VARCHAR(128) NOT NULL,
  `module_type` VARCHAR(32) NOT NULL DEFAULT 'demarcation',
  `data` LONGTEXT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`draft_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
