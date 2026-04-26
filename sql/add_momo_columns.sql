-- Migration: Add MoMo payment tracking columns to orders table
-- Run this ONCE against your database

-- Add momo_request_id column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS momo_request_id VARCHAR(100) NULL;

-- Add momo_trans_id column  
ALTER TABLE orders ADD COLUMN IF NOT EXISTS momo_trans_id VARCHAR(100) NULL;

-- Verify columns
-- DESCRIBE orders;
