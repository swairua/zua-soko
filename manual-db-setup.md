# Manual Database Setup

## Quick Setup

To manually deploy the database when needed, run:

```bash
npm run deploy-db
```

## Alternative Setup

If you prefer to set up the database manually:

1. **Connect to your Render.com database:**

   ```bash
   PGPASSWORD=OoageAtal4KEnVnXn2axejZJxpy4nXto psql -h dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com -U zuasoko_db_user zuasoko_db
   ```

2. **Run the setup SQL** (choose one):
   - `backend/database.sql` (if it exists)
   - `setup-render-db.sql` (fallback)

## Live Database Credentials

- **Host**: dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com
- **Database**: zuasoko_db
- **Username**: zuasoko_db_user
- **Password**: OoageAtal4KEnVnXn2axejZJxpy4nXto
- **Port**: 5432

## Test Login

After database setup, test with:

- **Phone**: +254712345678
- **Password**: password123

## Status

✅ Dependencies installed  
✅ Dev server running on port 3001  
✅ Application functional  
⏳ Database deployment available when needed
