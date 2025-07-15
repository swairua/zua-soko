# Database Setup Guide

## Prerequisites

1. **PostgreSQL Installation**

   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql

   # Windows - Download from postgresql.org
   ```

2. **Start PostgreSQL Service**

   ```bash
   # Ubuntu/Debian
   sudo systemctl start postgresql
   sudo systemctl enable postgresql

   # macOS
   brew services start postgresql
   ```

## Database Setup

1. **Access PostgreSQL as superuser**

   ```bash
   sudo -u postgres psql
   ```

2. **Create database and user**

   ```sql
   -- Create user
   CREATE USER zuasoko_user WITH PASSWORD 'your_password_here';

   -- Create database
   CREATE DATABASE zuasoko_db OWNER zuasoko_user;

   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE zuasoko_db TO zuasoko_user;

   -- Exit
   \q
   ```

3. **Initialize schema**

   ```bash
   # Option 1: Using the migration file
   psql -U zuasoko_user -d zuasoko_db -f database/migration.sql

   # Option 2: Using the schema file
   psql -U zuasoko_user -d zuasoko_db -f backend/src/database/schema.sql
   ```

4. **Verify setup**
   ```bash
   psql -U zuasoko_user -d zuasoko_db -c "\dt"
   ```

## Environment Configuration

Update `backend/.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zuasoko_db
DB_USER=zuasoko_user
DB_PASSWORD=your_password_here
```

## Troubleshooting

### Connection Issues

1. **Check PostgreSQL is running**

   ```bash
   sudo systemctl status postgresql
   ```

2. **Check if port 5432 is available**

   ```bash
   sudo netstat -tlnp | grep 5432
   ```

3. **Check PostgreSQL configuration**

   ```bash
   sudo nano /etc/postgresql/[version]/main/postgresql.conf
   # Ensure: listen_addresses = 'localhost'

   sudo nano /etc/postgresql/[version]/main/pg_hba.conf
   # Ensure: local   all   all   md5
   ```

### Permission Issues

1. **Grant additional privileges if needed**

   ```sql
   GRANT CREATE ON SCHEMA public TO zuasoko_user;
   GRANT USAGE ON SCHEMA public TO zuasoko_user;
   ```

2. **Check user exists**
   ```sql
   \du
   ```

## Demo Data

The application will automatically create demo users when started:

- Admin: +254712345678 / password123
- Farmer: +254734567890 / password123
- Customer: +254756789012 / password123
- Driver: +254778901234 / password123
