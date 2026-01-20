-- Migration: Add damage_compensation_total column to orders table
-- Run this on Railway PostgreSQL if the column doesn't exist

-- Add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'damage_compensation_total'
    ) THEN
        ALTER TABLE orders ADD COLUMN damage_compensation_total DECIMAL(10,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Column damage_compensation_total added to orders table';
    ELSE
        RAISE NOTICE 'Column damage_compensation_total already exists';
    END IF;
END $$;
