-- =====================================================
-- INLINKAI ESSENTIAL DATABASE SCHEMA FOR MYSQL
-- =====================================================
-- Minimal required tables for immediate functionality
-- Run this first to get the app working quickly
-- =====================================================

-- Set MySQL settings for better compatibility
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `verification`;
DROP TABLE IF EXISTS `account`;
DROP TABLE IF EXISTS `session`;
DROP TABLE IF EXISTS `user`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- CORE AUTHENTICATION TABLES (Better Auth Compatible)
-- =====================================================

-- Users table - Main user information
CREATE TABLE `user` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `name` TEXT NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `emailVerified` BOOLEAN NOT NULL DEFAULT FALSE,
    `image` TEXT,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    -- Simple onboarding tracking
    `onboarding_complete` BOOLEAN DEFAULT FALSE,
    
    -- Basic profile info
    `linkedin_username` VARCHAR(255),
    `subscription_status` ENUM('free', 'pro') DEFAULT 'free',
    `is_admin` BOOLEAN DEFAULT FALSE,
    
    -- Performance indexes
    INDEX `idx_user_email` (`email`),
    INDEX `idx_user_onboarding` (`onboarding_complete`),
    INDEX `idx_user_subscription` (`subscription_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table - Authentication sessions
CREATE TABLE `session` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `expiresAt` TIMESTAMP NOT NULL,
    `token` VARCHAR(255) NOT NULL UNIQUE,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    `ipAddress` VARCHAR(45),
    `userAgent` TEXT,
    `userId` VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    INDEX `idx_session_token` (`token`),
    INDEX `idx_session_user` (`userId`),
    INDEX `idx_session_expires` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OAuth accounts table - Social login (LinkedIn)
CREATE TABLE `account` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `accountId` TEXT NOT NULL,
    `providerId` TEXT NOT NULL,
    `userId` VARCHAR(255) NOT NULL,
    `accessToken` TEXT,
    `refreshToken` TEXT,
    `idToken` TEXT,
    `accessTokenExpiresAt` TIMESTAMP NULL,
    `refreshTokenExpiresAt` TIMESTAMP NULL,
    `scope` TEXT,
    `password` TEXT,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    INDEX `idx_account_user` (`userId`),
    INDEX `idx_account_provider` (`providerId`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email verification
CREATE TABLE `verification` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `identifier` TEXT NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` TIMESTAMP NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    INDEX `idx_verification_expires` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset tokens
CREATE TABLE `password_reset_tokens` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL UNIQUE,
    `expires_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    INDEX `idx_reset_email` (`email`),
    INDEX `idx_reset_token` (`token`),
    INDEX `idx_reset_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT SAMPLE DATA FOR TESTING
-- =====================================================

-- Note: Users will be created automatically through OAuth
-- This is just for reference of the expected data structure

-- Sample admin user (will be created via OAuth)
-- INSERT INTO `user` (`id`, `name`, `email`, `emailVerified`, `onboarding_complete`, `is_admin`, `subscription_status`) 
-- VALUES ('admin-user-id', 'Admin User', 'admin@inlinkai.com', TRUE, TRUE, TRUE, 'pro');

-- =====================================================
-- CLEANUP EVENTS
-- =====================================================

-- Clean up expired sessions every hour
CREATE EVENT IF NOT EXISTS `cleanup_expired_sessions`
ON SCHEDULE EVERY 1 HOUR
DO
DELETE FROM `session` WHERE `expiresAt` < NOW();

-- Clean up expired reset tokens daily
CREATE EVENT IF NOT EXISTS `cleanup_expired_reset_tokens`
ON SCHEDULE EVERY 1 DAY
DO
DELETE FROM `password_reset_tokens` WHERE `expires_at` < NOW();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('user', 'session', 'account', 'verification', 'password_reset_tokens')
ORDER BY TABLE_NAME;

-- Check indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('user', 'session', 'account')
ORDER BY TABLE_NAME, INDEX_NAME;

-- =====================================================
-- USAGE NOTES
-- =====================================================
/*
ESSENTIAL TABLES CREATED:

1. `user` - Core user data with onboarding flag
2. `session` - Authentication sessions  
3. `account` - OAuth connections (LinkedIn)
4. `verification` - Email verification tokens
5. `password_reset_tokens` - Password reset system

FEATURES INCLUDED:
- Better Auth compatibility
- Simple onboarding tracking (just boolean flag)
- LinkedIn OAuth support
- Password reset functionality
- Automatic cleanup of expired data
- Performance indexes
- Foreign key constraints

TO USE:
1. Run this script in your MySQL database
2. Update your .env with: DATABASE_URL=mysql://user:pass@host:port/database
3. Your app should now work with the simplified onboarding system

NEXT STEPS:
- Run the complete schema (database-schema-complete.sql) when ready for full features
- Add Autumn subscription tables when billing is needed
- Add analytics tables when tracking is required
*/
