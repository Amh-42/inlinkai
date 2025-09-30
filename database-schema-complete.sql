-- =====================================================
-- INLINKAI COMPLETE DATABASE SCHEMA FOR MYSQL
-- =====================================================
-- This script creates all necessary tables for the InlinkAI application
-- with detailed features, indexes, and constraints
-- =====================================================

-- Drop existing tables if they exist (for clean setup)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `user_activity`;
DROP TABLE IF EXISTS `email_campaigns`;
DROP TABLE IF EXISTS `email_templates`;
DROP TABLE IF EXISTS `feature_usage`;
DROP TABLE IF EXISTS `autumn_subscriptions`;
DROP TABLE IF EXISTS `autumn_products`;
DROP TABLE IF EXISTS `verification`;
DROP TABLE IF EXISTS `account`;
DROP TABLE IF EXISTS `session`;
DROP TABLE IF EXISTS `user`;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- CORE AUTHENTICATION TABLES (Better Auth)
-- =====================================================

-- Users table - Core user information
CREATE TABLE `user` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `name` TEXT NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `emailVerified` BOOLEAN NOT NULL DEFAULT FALSE,
    `image` TEXT,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    -- Onboarding fields
    `onboarding_complete` BOOLEAN DEFAULT FALSE,
    `onboarding_role` TEXT,
    `onboarding_discovery` TEXT,
    `onboarding_terms` TEXT,
    `onboarding_marketing` BOOLEAN DEFAULT FALSE,
    
    -- Profile fields
    `linkedin_username` VARCHAR(255),
    `company` VARCHAR(255),
    `job_title` VARCHAR(255),
    `bio` TEXT,
    `timezone` VARCHAR(50) DEFAULT 'UTC',
    `language` VARCHAR(10) DEFAULT 'en',
    
    -- Preferences
    `email_notifications` BOOLEAN DEFAULT TRUE,
    `marketing_emails` BOOLEAN DEFAULT FALSE,
    `weekly_digest` BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    `last_login_at` TIMESTAMP NULL,
    `login_count` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `is_admin` BOOLEAN DEFAULT FALSE,
    `subscription_status` ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
    
    INDEX `idx_user_email` (`email`),
    INDEX `idx_user_onboarding` (`onboarding_complete`),
    INDEX `idx_user_subscription` (`subscription_status`),
    INDEX `idx_user_active` (`is_active`),
    INDEX `idx_user_linkedin` (`linkedin_username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table - User authentication sessions
CREATE TABLE `session` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `expiresAt` TIMESTAMP NOT NULL,
    `token` VARCHAR(255) NOT NULL UNIQUE,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    `ipAddress` VARCHAR(45), -- IPv6 compatible
    `userAgent` TEXT,
    `userId` VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    INDEX `idx_session_token` (`token`),
    INDEX `idx_session_user` (`userId`),
    INDEX `idx_session_expires` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OAuth accounts table - Social login connections
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
    `password` TEXT, -- For email/password accounts
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    INDEX `idx_account_user` (`userId`),
    INDEX `idx_account_provider` (`providerId`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email verification tokens
CREATE TABLE `verification` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `identifier` TEXT NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` TIMESTAMP NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    INDEX `idx_verification_expires` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PASSWORD RESET SYSTEM
-- =====================================================

-- Password reset tokens
CREATE TABLE `password_reset_tokens` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL UNIQUE,
    `expires_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `used_at` TIMESTAMP NULL,
    `ip_address` VARCHAR(45),
    
    INDEX `idx_reset_email` (`email`),
    INDEX `idx_reset_token` (`token`),
    INDEX `idx_reset_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SUBSCRIPTION & BILLING (AUTUMN)
-- =====================================================

-- Autumn products configuration
CREATE TABLE `autumn_products` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `currency` VARCHAR(3) DEFAULT 'USD',
    `billing_interval` ENUM('month', 'year', 'one_time') DEFAULT 'month',
    `features` JSON, -- Store feature list as JSON
    `message_limit` INT DEFAULT 0, -- Monthly message limit
    `is_default` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_product_active` (`is_active`),
    INDEX `idx_product_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User subscriptions
CREATE TABLE `autumn_subscriptions` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `user_id` VARCHAR(255) NOT NULL,
    `product_id` VARCHAR(255) NOT NULL,
    `stripe_subscription_id` VARCHAR(255),
    `stripe_customer_id` VARCHAR(255),
    `status` ENUM('active', 'canceled', 'past_due', 'unpaid', 'trialing') DEFAULT 'active',
    `current_period_start` TIMESTAMP NULL,
    `current_period_end` TIMESTAMP NULL,
    `cancel_at_period_end` BOOLEAN DEFAULT FALSE,
    `canceled_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `autumn_products` (`id`),
    INDEX `idx_subscription_user` (`user_id`),
    INDEX `idx_subscription_status` (`status`),
    INDEX `idx_subscription_stripe` (`stripe_subscription_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- FEATURE USAGE TRACKING
-- =====================================================

-- Track feature usage for billing and analytics
CREATE TABLE `feature_usage` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(255) NOT NULL,
    `feature_type` ENUM('ai_message', 'profile_optimization', 'crm_build', 'email_send', 'vapi_call') NOT NULL,
    `feature_data` JSON, -- Store feature-specific data
    `usage_count` INT DEFAULT 1,
    `billing_period` DATE NOT NULL, -- YYYY-MM-01 for monthly tracking
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    INDEX `idx_usage_user_period` (`user_id`, `billing_period`),
    INDEX `idx_usage_feature` (`feature_type`),
    INDEX `idx_usage_period` (`billing_period`),
    UNIQUE KEY `uk_user_feature_period` (`user_id`, `feature_type`, `billing_period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- EMAIL SYSTEM
-- =====================================================

-- Email templates
CREATE TABLE `email_templates` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `subject` VARCHAR(255) NOT NULL,
    `template_type` ENUM('welcome', 'newsletter', 'announcement', 'password_reset', 'notification') NOT NULL,
    `html_content` LONGTEXT NOT NULL,
    `text_content` TEXT,
    `variables` JSON, -- Available template variables
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_by` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON SET NULL,
    INDEX `idx_template_type` (`template_type`),
    INDEX `idx_template_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email campaigns and sends
CREATE TABLE `email_campaigns` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `template_id` INT NOT NULL,
    `sender_id` VARCHAR(255) NOT NULL,
    `recipient_type` ENUM('all_users', 'opted_in', 'specific_users', 'test') DEFAULT 'opted_in',
    `recipient_filter` JSON, -- Filters for targeting
    `status` ENUM('draft', 'scheduled', 'sending', 'sent', 'failed') DEFAULT 'draft',
    `scheduled_at` TIMESTAMP NULL,
    `sent_at` TIMESTAMP NULL,
    `total_recipients` INT DEFAULT 0,
    `successful_sends` INT DEFAULT 0,
    `failed_sends` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`template_id`) REFERENCES `email_templates` (`id`),
    FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`),
    INDEX `idx_campaign_status` (`status`),
    INDEX `idx_campaign_scheduled` (`scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- USER ACTIVITY & ANALYTICS
-- =====================================================

-- User activity log
CREATE TABLE `user_activity` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(255) NOT NULL,
    `activity_type` ENUM('login', 'logout', 'onboarding_complete', 'subscription_change', 'feature_use', 'profile_update') NOT NULL,
    `activity_data` JSON, -- Store activity-specific data
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    INDEX `idx_activity_user` (`user_id`),
    INDEX `idx_activity_type` (`activity_type`),
    INDEX `idx_activity_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User sessions tracking (separate from auth sessions)
CREATE TABLE `user_sessions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(255) NOT NULL,
    `session_start` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `session_end` TIMESTAMP NULL,
    `duration_seconds` INT NULL,
    `pages_visited` INT DEFAULT 0,
    `features_used` JSON, -- Array of features used in session
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `referrer` TEXT,
    
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    INDEX `idx_user_sessions_user` (`user_id`),
    INDEX `idx_user_sessions_start` (`session_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default Autumn products
INSERT INTO `autumn_products` (`id`, `name`, `description`, `price`, `message_limit`, `is_default`, `features`) VALUES
('free', 'Free Plan', 'Perfect for getting started with InlinkAI', 0.00, 5, TRUE, JSON_ARRAY('Basic LinkedIn optimization', '5 AI messages per month', 'Email support')),
('pro', 'Pro Plan', 'For power users and professionals', 20.00, 100, FALSE, JSON_ARRAY('Advanced LinkedIn optimization', '100 AI messages per month', 'CRM building', 'Priority support', 'Advanced analytics'));

-- Insert default email templates
INSERT INTO `email_templates` (`name`, `subject`, `template_type`, `html_content`, `text_content`, `variables`) VALUES
('welcome_simple', 'Welcome to InlinkAI! 🚀', 'welcome', 
'<h1>Welcome {{firstName}}!</h1><p>Thanks for joining InlinkAI. We\'re excited to help you optimize your LinkedIn presence.</p>', 
'Welcome {{firstName}}! Thanks for joining InlinkAI.', 
JSON_OBJECT('firstName', 'User first name', 'userEmail', 'User email address')),

('password_reset', '🔑 Reset Your InlinkAI Password', 'password_reset',
'<h1>Password Reset</h1><p>Click the link below to reset your password:</p><a href="{{resetUrl}}">Reset Password</a>',
'Password Reset: {{resetUrl}}',
JSON_OBJECT('resetUrl', 'Password reset URL', 'userName', 'User name'));

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional performance indexes
CREATE INDEX `idx_user_created_at` ON `user` (`createdAt`);
CREATE INDEX `idx_user_last_login` ON `user` (`last_login_at`);
CREATE INDEX `idx_session_created_at` ON `session` (`createdAt`);
CREATE INDEX `idx_feature_usage_created_at` ON `feature_usage` (`created_at`);
CREATE INDEX `idx_user_activity_created_at` ON `user_activity` (`created_at`);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active users view
CREATE VIEW `active_users` AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.subscription_status,
    u.last_login_at,
    u.login_count,
    COUNT(s.id) as active_sessions
FROM `user` u
LEFT JOIN `session` s ON u.id = s.userId AND s.expiresAt > NOW()
WHERE u.is_active = TRUE
GROUP BY u.id, u.name, u.email, u.subscription_status, u.last_login_at, u.login_count;

-- Monthly usage summary view
CREATE VIEW `monthly_usage_summary` AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.subscription_status,
    DATE_FORMAT(fu.billing_period, '%Y-%m') as month,
    SUM(CASE WHEN fu.feature_type = 'ai_message' THEN fu.usage_count ELSE 0 END) as ai_messages_used,
    SUM(fu.usage_count) as total_feature_usage
FROM `user` u
LEFT JOIN `feature_usage` fu ON u.id = fu.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.name, u.email, u.subscription_status, DATE_FORMAT(fu.billing_period, '%Y-%m');

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to track feature usage
CREATE PROCEDURE `TrackFeatureUsage`(
    IN p_user_id VARCHAR(255),
    IN p_feature_type VARCHAR(50),
    IN p_feature_data JSON,
    IN p_usage_count INT
)
BEGIN
    DECLARE current_period DATE;
    SET current_period = DATE_FORMAT(NOW(), '%Y-%m-01');
    
    INSERT INTO `feature_usage` (user_id, feature_type, feature_data, usage_count, billing_period)
    VALUES (p_user_id, p_feature_type, p_feature_data, p_usage_count, current_period)
    ON DUPLICATE KEY UPDATE 
        usage_count = usage_count + p_usage_count,
        feature_data = p_feature_data;
END //

-- Procedure to get user's monthly usage
CREATE PROCEDURE `GetUserMonthlyUsage`(
    IN p_user_id VARCHAR(255),
    IN p_year INT,
    IN p_month INT
)
BEGIN
    DECLARE billing_period DATE;
    SET billing_period = DATE(CONCAT(p_year, '-', LPAD(p_month, 2, '0'), '-01'));
    
    SELECT 
        feature_type,
        usage_count,
        feature_data
    FROM `feature_usage`
    WHERE user_id = p_user_id 
    AND billing_period = billing_period;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS FOR AUTOMATION
-- =====================================================

DELIMITER //

-- Update user login stats on session creation
CREATE TRIGGER `update_user_login_stats`
AFTER INSERT ON `session`
FOR EACH ROW
BEGIN
    UPDATE `user` 
    SET 
        last_login_at = NOW(),
        login_count = login_count + 1
    WHERE id = NEW.userId;
    
    INSERT INTO `user_activity` (user_id, activity_type, activity_data, ip_address, user_agent)
    VALUES (NEW.userId, 'login', JSON_OBJECT('session_id', NEW.id), NEW.ipAddress, NEW.userAgent);
END //

-- Log onboarding completion
CREATE TRIGGER `log_onboarding_completion`
AFTER UPDATE ON `user`
FOR EACH ROW
BEGIN
    IF OLD.onboarding_complete = FALSE AND NEW.onboarding_complete = TRUE THEN
        INSERT INTO `user_activity` (user_id, activity_type, activity_data)
        VALUES (NEW.id, 'onboarding_complete', JSON_OBJECT('completed_at', NOW()));
    END IF;
END //

DELIMITER ;

-- =====================================================
-- FINAL SETUP COMMANDS
-- =====================================================

-- Enable event scheduler for cleanup tasks
SET GLOBAL event_scheduler = ON;

-- Create event to clean up expired sessions
CREATE EVENT IF NOT EXISTS `cleanup_expired_sessions`
ON SCHEDULE EVERY 1 HOUR
DO
DELETE FROM `session` WHERE `expiresAt` < NOW();

-- Create event to clean up old password reset tokens
CREATE EVENT IF NOT EXISTS `cleanup_expired_reset_tokens`
ON SCHEDULE EVERY 1 DAY
DO
DELETE FROM `password_reset_tokens` WHERE `expires_at` < NOW();

-- =====================================================
-- SUMMARY
-- =====================================================
/*
This schema includes:

CORE TABLES:
- user: Complete user profiles with onboarding, preferences, and metadata
- session: Authentication sessions with tracking
- account: OAuth and credential accounts
- verification: Email verification tokens
- password_reset_tokens: Secure password reset system

SUBSCRIPTION SYSTEM:
- autumn_products: Product configurations with features and pricing
- autumn_subscriptions: User subscription management
- feature_usage: Usage tracking for billing and limits

EMAIL SYSTEM:
- email_templates: Reusable email templates
- email_campaigns: Campaign management and tracking

ANALYTICS:
- user_activity: Comprehensive activity logging
- user_sessions: Session analytics and tracking

PERFORMANCE FEATURES:
- Comprehensive indexing for fast queries
- Views for common data access patterns
- Stored procedures for complex operations
- Triggers for automatic data maintenance
- Scheduled events for cleanup tasks

SECURITY FEATURES:
- Foreign key constraints for data integrity
- Proper character sets and collations
- Secure token management
- Activity logging for audit trails
*/
