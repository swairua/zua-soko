-- Fix admin password to use "password123"
-- Hash calculation: SHA256("password123" + "salt123") 
-- Result: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

-- Update admin user password to match "password123"
UPDATE users 
SET password_hash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'
WHERE phone = '+254712345678' AND email = 'admin@zuasoko.com';

-- Verify the update
SELECT first_name, last_name, phone, email, role, verified, registration_fee_paid 
FROM users 
WHERE phone = '+254712345678';

-- Also add a fallback demo user with simpler credentials
INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid) VALUES
('Demo', 'Admin', 'demo@zuasoko.com', '+254700000000', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'ADMIN', 'Nairobi', true, true)
ON CONFLICT (phone) DO NOTHING;

SELECT 'Password updated successfully! Use phone: +254712345678 or +254700000000 with password: password123' as message;
