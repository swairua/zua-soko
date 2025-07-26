# Zuasoko Platform - Localhost Quick Reference

## 🚀 One-Minute Setup

```bash
# 1. Copy environment file
cp .env.localhost .env

# 2. Edit .env with your database credentials
# Update DB_PASSWORD with your PostgreSQL password

# 3. Create database (run in PostgreSQL as superuser)
createdb zuasoko_db
createuser zuasoko_user
psql -c "ALTER USER zuasoko_user WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE zuasoko_db TO zuasoko_user;"

# 4. Install dependencies
npm install
cd frontend && npm install && cd ..

# 5. Setup database
node setup-localhost-db.js

# 6. Start development
npm run localhost:dev
```

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 12+ installed and running
- [ ] Git installed
- [ ] Terminal/Command Prompt access

## 🔧 Manual Setup Steps

### 1. Environment Configuration

```bash
# Copy the localhost environment template
cp .env.localhost .env
cp frontend/.env.localhost frontend/.env.local
```

**Edit `.env` with your settings:**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zuasoko_db
DB_USER=zuasoko_user
DB_PASSWORD=your_actual_password
JWT_SECRET=generate_a_long_secure_string_here
```

### 2. PostgreSQL Database Setup

**Connect to PostgreSQL:**
```bash
sudo -u postgres psql
```

**Create database and user:**
```sql
CREATE DATABASE zuasoko_db;
CREATE USER zuasoko_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE zuasoko_db TO zuasoko_user;
\q
```

**Test connection:**
```bash
psql -h localhost -U zuasoko_user -d zuasoko_db
```

### 3. Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 4. Database Initialization

```bash
# Initialize schema and demo data
node setup-localhost-db.js
```

### 5. Start Development Servers

**Option A: Start both together**
```bash
npm run localhost:dev
```

**Option B: Start separately**
```bash
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5002
- **API Docs**: http://localhost:5002/api (basic endpoint list)

## 🔑 Demo Accounts

| Role     | Phone           | Password    | Description                    |
|----------|----------------|-------------|--------------------------------|
| Admin    | +254712345678  | password123 | Full system administration     |
| Farmer   | +254734567890  | password123 | Submit and manage consignments |
| Customer | +254756789012  | password123 | Browse and purchase products   |
| Driver   | +254778901234  | password123 | Handle deliveries              |

## 🛠️ Useful Commands

### Development
```bash
# Start both servers
npm run localhost:dev

# Start backend only
npm run backend:dev

# Start frontend only
npm run frontend:dev

# Build frontend for production
npm run frontend:build
```

### Database
```bash
# Reset database
node setup-localhost-db.js

# Connect to database
psql -h localhost -U zuasoko_user -d zuasoko_db

# View tables
psql -h localhost -U zuasoko_user -d zuasoko_db -c "\dt"
```

### Verification
```bash
# Verify system health
node verify-localhost-system.js

# Check backend API
curl http://localhost:5002/

# Check specific endpoint
curl http://localhost:5002/api/products
```

### Maintenance
```bash
# Clean install
rm -rf node_modules frontend/node_modules
npm install && cd frontend && npm install

# View logs (if logging enabled)
tail -f logs/app.log

# Check running processes
lsof -i :5002  # Backend
lsof -i :5173  # Frontend
```

## 🐛 Troubleshooting

### Database Issues

**Connection refused:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql
# OR
brew services list | grep postgres

# Start PostgreSQL
sudo systemctl start postgresql
# OR  
brew services start postgresql
```

**Authentication failed:**
```bash
# Reset user password
sudo -u postgres psql -c "ALTER USER zuasoko_user WITH PASSWORD 'newpassword';"

# Update .env file with new password
```

**Database doesn't exist:**
```bash
# List databases
psql -h localhost -U postgres -l

# Create if missing
createdb -h localhost -U postgres zuasoko_db
```

### Node.js Issues

**Module not found:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Permission denied:**
```bash
# Use npx instead of global install
npx create-react-app --version

# Or fix npm permissions
npm config set prefix ~/.npm-global
```

### Port Issues

**Port already in use:**
```bash
# Find process using port
lsof -i :5002
lsof -i :5173

# Kill process
kill -9 <PID>

# Use different port
PORT=5003 npm run backend:dev
```

### Frontend Issues

**Vite server won't start:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**API connection fails:**
```bash
# Check backend is running
curl http://localhost:5002/

# Check frontend .env.local
cat frontend/.env.local

# Verify VITE_API_URL matches backend
```

## 📊 System Verification

Run the verification script to check system health:

```bash
node verify-localhost-system.js
```

Expected output:
```
✅ Environment Variables
✅ Database Connection  
✅ Database Tables     
✅ Sample Data         
✅ Backend API         
✅ Frontend App        

🎯 Overall Score: 6/6 checks passed
🎉 System is fully operational!
```

## 🗂️ Project Structure

```
zuasoko-platform/
├── .env                          # Environment variables
├── .env.localhost               # Template for localhost
├── server.js                   # Main backend server
├── setup-localhost-db.js       # Database setup script
├── verify-localhost-system.js  # System verification
├── quick-start-localhost.sh    # Automated setup script
├── LOCALHOST_SETUP_GUIDE.md    # Detailed setup guide
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── db.js           # Database configuration  
│   │   │   └── schema.sql      # Database schema
│   │   └── ...
├── frontend/
│   ├── .env.local              # Frontend environment
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components
│   │   └── ...
│   └── package.json
└── package.json
```

## 🎯 Quick Tests

### Test API Login
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+254712345678", "password": "password123"}'
```

### Test Database Query
```bash
psql -h localhost -U zuasoko_user -d zuasoko_db \
  -c "SELECT first_name, role FROM users LIMIT 3;"
```

### Test Frontend Build
```bash
cd frontend
npm run build
npm run preview
```

## 📈 Next Steps

After successful setup:

1. **Explore the Admin Dashboard** - Login as admin to see all features
2. **Test Farmer Workflow** - Register as farmer, submit consignments
3. **Try Customer Experience** - Browse marketplace, add to cart
4. **Test Driver Functions** - Accept deliveries, manage assignments
5. **Customize the Platform** - Modify code to suit your needs

## 🆘 Need Help?

1. **Check the logs** - Backend logs show detailed error messages
2. **Run verification** - `node verify-localhost-system.js`
3. **Reset database** - `node setup-localhost-db.js`
4. **Check documentation** - `LOCALHOST_SETUP_GUIDE.md`
5. **Start fresh** - Delete `.env`, `node_modules`, and start over

## 🔗 Useful Links

- **Main Setup Guide**: [LOCALHOST_SETUP_GUIDE.md](LOCALHOST_SETUP_GUIDE.md)
- **Project README**: [README.md](README.md)
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Node.js Docs**: https://nodejs.org/docs/
- **Vite Docs**: https://vitejs.dev/guide/

---

**Happy coding! 🚀**

*For additional support, check the troubleshooting section or refer to the detailed setup guide.*
