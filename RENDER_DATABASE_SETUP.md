# Render.com Database Setup Instructions

## Database Configuration

**Database Connection Details:**

- Host: `dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com`
- Port: `5432`
- Database: `zuasoko_db`
- Username: `zuasoko_db_user`
- Password: `OoageAtal4KEnVnXn2axejZJxpy4nXto`

**Connection URL:**

```
postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db
```

## Setup Instructions

### Option 1: Using PSQL Command Line

```bash
PGPASSWORD=OoageAtal4KEnVnXn2axejZJxpy4nXto psql -h dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com -U zuasoko_db_user zuasoko_db -f setup-render-db.sql
```

### Option 2: Using Render.com Dashboard

1. Go to your Render.com dashboard
2. Navigate to your PostgreSQL service
3. Click on "Connect" → "External Connection"
4. Use the Web Shell or copy the SQL commands from `setup-render-db.sql`

### Option 3: Using Database GUI (Recommended)

1. Use a tool like pgAdmin, DBeaver, or TablePlus
2. Connect using the credentials above
3. Execute the contents of `setup-render-db.sql`

## Environment Configuration

The application has been configured with the following environment variable:

```
DATABASE_URL=postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db
```

## Verification

After setup, the application should:

1. Connect to the real database instead of demo mode
2. Show "Render.com DB" in the database status indicator
3. Load actual product data from the database
4. Support user registration and authentication

## Seed Data Created

The setup script creates:

- 5 demo users (Admin, Farmers, Customer, Driver)
- 2 warehouses
- 5 sample consignments
- 5 marketplace products
- Wallet records for farmers

### Demo Login Credentials

**Admin User:**

- Email: admin@zuasoko.com
- Phone: +254712345678
- Password: admin123

**Farmer User:**

- Email: john@farmer.com
- Phone: +254723456789
- Password: farmer123

**Customer User:**

- Email: jane@customer.com
- Phone: +254734567890
- Password: customer123

## Next Steps

1. Execute the database setup script
2. Test the health endpoint: `/api/health`
3. Verify database connection shows "connected" status
4. Test user login with the demo credentials
5. Verify products are loaded from the database

## Troubleshooting

If you encounter issues:

1. Check database connectivity from your location
2. Verify SSL settings (the app uses `ssl: { rejectUnauthorized: false }`)
3. Check connection timeout settings
4. Review database logs in Render.com dashboard
