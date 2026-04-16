-- Create user_addresses table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    line1 VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for user_addresses
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- Add missing payment-related columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS payment_transaction_id VARCHAR(100);

-- Add shipping_address_id after user_addresses table is created
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_address_id INTEGER;

-- Drop the old foreign key constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_shipping_address_id_fkey'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_shipping_address_id_fkey;
    END IF;
END
$$;

-- Add new foreign key constraint to user_addresses
ALTER TABLE orders
ADD CONSTRAINT orders_shipping_address_id_fkey
FOREIGN KEY (shipping_address_id) REFERENCES user_addresses(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_address ON orders(shipping_address_id);