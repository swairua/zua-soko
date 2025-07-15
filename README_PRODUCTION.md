# Zuasoko Production Environment

## 🚀 Production Deployment Status

- **Frontend URL**: https://appzua.zuasoko.com
- **Backend API**: https://appzua.zuasoko.com/api
- **Database**: PostgreSQL (caeybwbb_zuasoko_db)
- **Environment**: Production

## 📋 Quick Commands

### Start/Stop Services

```bash
# Start all services
./deploy-production.sh

# Start with PM2 (recommended)
pm2 start ecosystem.config.js

# Stop services
pm2 stop zuasoko-backend
sudo systemctl stop nginx
```

### Health Monitoring

```bash
# Run health check
./health-check.sh

# Check specific services
curl https://appzua.zuasoko.com/health
pm2 status
sudo systemctl status nginx
```

### View Logs

```bash
# Backend logs
pm2 logs zuasoko-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
tail -f logs/backend.log
```

### Database Operations

```bash
# Connect to database
psql -h localhost -U caeybwbb_user -d caeybwbb_zuasoko_db

# Backup database
pg_dump -h localhost -U caeybwbb_user caeybwbb_zuasoko_db > backup_$(date +%Y%m%d).sql

# Check table status
psql -h localhost -U caeybwbb_user -d caeybwbb_zuasoko_db -c "\dt"
```

## 🔧 Deployment Files

- `backend/.env` - Production environment variables
- `frontend/.env` - Frontend configuration
- `nginx.conf` - Nginx web server configuration
- `ecosystem.config.js` - PM2 process manager configuration
- `deploy-production.sh` - Automated deployment script

## 👥 Demo Users

| Role     | Phone         | Password    |
| -------- | ------------- | ----------- |
| Admin    | +254712345678 | password123 |
| Farmer   | +254734567890 | password123 |
| Customer | +254756789012 | password123 |
| Driver   | +254778901234 | password123 |

## 🔒 Security Features

- ✅ HTTPS with SSL certificates
- ✅ JWT authentication
- ✅ Password hashing with Argon2
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Environment variable protection

## 📊 System Requirements

- **Node.js**: ≥18.0.0
- **PostgreSQL**: ≥13.0
- **Nginx**: ≥1.18
- **Memory**: ≥2GB RAM
- **Storage**: ≥10GB available space

## 📞 Support

For production issues:

1. Run `./health-check.sh` to diagnose problems
2. Check logs with `pm2 logs zuasoko-backend`
3. Verify database connectivity
4. Check nginx configuration with `sudo nginx -t`
5. Review SSL certificate status

## 🔄 Update Process

```bash
# 1. Backup current state
pg_dump -h localhost -U caeybwbb_user caeybwbb_zuasoko_db > backup_before_update.sql

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 4. Build frontend
cd frontend && npm run build && cd ..

# 5. Restart services
pm2 restart zuasoko-backend
sudo cp -r frontend/dist/* /var/www/zuasoko/frontend/dist/
sudo nginx -s reload

# 6. Verify deployment
./health-check.sh
```

## 🚨 Emergency Procedures

### Backend Down

```bash
pm2 restart zuasoko-backend
# or
pm2 start ecosystem.config.js
```

### Database Issues

```bash
# Check connection
psql -h localhost -U caeybwbb_user -d caeybwbb_zuasoko_db -c "SELECT version();"

# Restart PostgreSQL (if needed)
sudo systemctl restart postgresql
```

### Frontend Not Loading

```bash
# Check nginx
sudo nginx -t
sudo systemctl restart nginx

# Rebuild frontend
cd frontend && npm run build && cd ..
sudo cp -r frontend/dist/* /var/www/zuasoko/frontend/dist/
```

### SSL Certificate Issues

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

✅ **Production Environment Ready**  
🌐 **Live at**: https://appzua.zuasoko.com
