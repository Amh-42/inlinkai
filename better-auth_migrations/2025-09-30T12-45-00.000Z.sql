-- Add onboarding columns to user table for MySQL
-- Migration: Add onboarding flow columns
-- Date: 2025-09-30

ALTER TABLE `user` ADD COLUMN `onboarding_complete` BOOLEAN DEFAULT FALSE;
ALTER TABLE `user` ADD COLUMN `onboarding_role` TEXT;
ALTER TABLE `user` ADD COLUMN `onboarding_discovery` TEXT;
ALTER TABLE `user` ADD COLUMN `onboarding_terms` TEXT;
ALTER TABLE `user` ADD COLUMN `onboarding_marketing` BOOLEAN DEFAULT FALSE;

-- Create index for faster onboarding status queries
CREATE INDEX idx_user_onboarding_complete ON `user` (`onboarding_complete`);
