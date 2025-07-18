# Database Setup Instructions

## Current Issue

The 500 error occurs because the database tables and users haven't been created yet.

## Step 1: Execute Database Setup

You need to run the database setup script on your Render.com PostgreSQL database.

### Option A: Using psql command line

```bash
PGPASSWORD=OoageAtal4KEnVnXn2axejZJxpy4nXto psql -h dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com -U zuasoko_db_user zuasoko_db -f setup-render-db.sql
```

### Option B: Using Render.com Dashboard

1. Go to your Render.com dashboard
2. Navigate to your PostgreSQL service
3. Click "Connect" → "Shell"
4. Copy and paste the contents of `setup-render-db.sql`

### Option C: Using a database GUI (Recommended)

1. Use pgAdmin, DBeaver, or TablePlus
2. Connect with these credentials:
   - Host: `dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com`
   - Port: `5432`
   - Database: `zuasoko_db`
   - Username: `zuasoko_db_user`
   - Password: `OoageAtal4KEnVnXn2axejZJxpy4nXto`
3. Execute the contents of `setup-render-db.sql`

## Step 2: Login Credentials

After the database is set up, you can login with:

**Option 1: Admin User**

- Phone: `+254712345678`
- Password: `password123`

**Option 2: Farmer User**

- Phone: `+254723456789`
- Password: `farmer123`

**Option 3: Customer User**

- Phone: `+254734567890`
- Password: `customer123`

## Verification

1. After setup, refresh your app
2. The database status should change from "Demo Mode" to "Render.com DB"
3. Try logging in with the credentials above
4. You should see actual product data instead of demo data

## If you still get 500 errors:

Run this additional SQL to fix the admin password specifically:

\`\`\`sql
-- Update admin password hash for "password123"
UPDATE users
SET password_hash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'
WHERE phone = '+254712345678';

-- Verify user exists
SELECT first_name, last_name, phone, email, role
FROM users
WHERE phone = '+254712345678';
\`\`\`

This will ensure the password hash matches exactly what you're trying to use.
