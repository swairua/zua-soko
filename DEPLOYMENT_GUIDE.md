# Zuasoko Production Deployment Guide

## Quick Start

Your application is configured for production deployment at `https://appzua.zuasoko.com` with the following database:

- **Database**: caeybwbb_zuasoko_db
- **User**: caeybwbb_user
- **Host**: localhost
- **Port**: 5432

## 1. Database Setup

### Initialize Database Schema

```bash
# Connect to your database and run the schema
psql -h localhost -U caeybwbb_user -d caeybwbb_zuasoko_db -f backend/src/database/schema.sql
```

### Verify Database Connection

```bash
# Test connection
psql -h localhost -U caeybwbb_user -d caeybwbb_zuasoko_db -c "SELECT version();"
```

## 2. Server Deployment

### Option A: Automated Deployment

```bash
# Run the automated deployment script
./deploy-production.sh
```

### Option B: Manual Deployment

#### Install Dependencies

```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

#### Build Frontend

```bash
cd frontend
npm run build
cd ..
```

#### Start Backend

```bash
cd backend
# Option 1: Start in background
nohup npm start > ../logs/backend.log 2>&1 &

# Option 2: Use PM2 (recommended for production)
npm install -g pm2
pm2 start src/server.js --name "zuasoko-backend"
pm2 save
pm2 startup
```

## 3. Web Server Configuration

### Nginx Setup

1. **Install Nginx** (if not installed)

```bash
sudo apt update
sudo apt install nginx
```

2. **Configure Site**

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/zuasoko

# Enable site
sudo ln -s /etc/nginx/sites-available/zuasoko /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default
```

3. **Update nginx.conf paths**

```bash
# Edit the nginx config file
sudo nano /etc/nginx/sites-available/zuasoko

# Update these paths:
# - root /var/www/zuasoko/frontend/dist;
# - ssl_certificate /path/to/your/certificate.crt;
# - ssl_certificate_key /path/to/your/private.key;
```

4. **Deploy Frontend Files**

```bash
# Create web directory
sudo mkdir -p /var/www/zuasoko

# Copy frontend build
sudo cp -r frontend/dist/* /var/www/zuasoko/frontend/dist/

# Set permissions
sudo chown -R www-data:www-data /var/www/zuasoko
sudo chmod -R 755 /var/www/zuasoko
```

5. **Start Nginx**

```bash
# Test configuration
sudo nginx -t

# Start/restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 4. SSL Certificate Setup

### Option A: Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d appzua.zuasoko.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option B: Upload Your SSL Certificate

```bash
# Upload your certificate files to:
# /etc/ssl/certs/appzua.zuasoko.com.crt
# /etc/ssl/private/appzua.zuasoko.com.key

# Update nginx.conf with correct paths
sudo nano /etc/nginx/sites-available/zuasoko
```

## 5. Domain Configuration

Ensure your domain `appzua.zuasoko.com` points to your server's IP address:

```bash
# Check DNS resolution
nslookup appzua.zuasoko.com

# Check if your server is accessible
curl -I http://appzua.zuasoko.com
```

## 6. Firewall Configuration

```bash
# Allow HTTP and HTTPS traffic
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## 7. Process Management (Recommended)

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start src/server.js --name "zuasoko-backend" --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command

# Monitor processes
pm2 status
pm2 logs zuasoko-backend
```

## 8. Verification

### Check Services

```bash
# Check backend is running
curl http://localhost:5001/health

# Check nginx is serving frontend
curl -I https://appzua.zuasoko.com

# Check database connection
psql -h localhost -U caeybwbb_user -d caeybwbb_zuasoko_db -c "SELECT COUNT(*) FROM users;"
```

### Test Application

1. **Visit**: https://appzua.zuasoko.com
2. **Login with demo users**:
   - Admin: +254712345678 / password123
   - Farmer: +254734567890 / password123
   - Customer: +254756789012 / password123
   - Driver: +254778901234 / password123

## 9. Monitoring and Logs

### View Logs

```bash
# Backend logs (if using PM2)
pm2 logs zuasoko-backend

# Backend logs (if using nohup)
tail -f logs/backend.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### Monitor Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
ps aux | grep nginx
```

## 10. Maintenance Commands

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild frontend
cd frontend && npm run build && cd ..

# Restart backend
pm2 restart zuasoko-backend

# Reload nginx
sudo nginx -s reload
```

### Backup Database

```bash
# Create backup
pg_dump -h localhost -U caeybwbb_user caeybwbb_zuasoko_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U caeybwbb_user -d caeybwbb_zuasoko_db < backup_file.sql
```

## 11. Troubleshooting

### Common Issues

**Backend not starting:**

```bash
# Check logs
pm2 logs zuasoko-backend
# or
tail -f logs/backend.log

# Check port availability
netstat -tlnp | grep 5001
```

**Database connection issues:**

```bash
# Test connection
psql -h localhost -U caeybwbb_user -d caeybwbb_zuasoko_db

# Check environment variables
cat backend/.env
```

**Frontend not loading:**

```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx configuration
sudo nginx -t

# Check frontend build
ls -la /var/www/zuasoko/frontend/dist/
```

**SSL issues:**

```bash
# Check certificate
openssl x509 -in /etc/ssl/certs/appzua.zuasoko.com.crt -text -noout

# Renew Let's Encrypt
sudo certbot renew --dry-run
```

## Success! 🎉

Your Zuasoko application should now be running at:

- **URL**: https://appzua.zuasoko.com
- **Backend API**: https://appzua.zuasoko.com/api
- **Health Check**: https://appzua.zuasoko.com/health

## Support

For issues or questions:

1. Check the logs first
2. Verify all services are running
3. Test database connectivity
4. Check nginx configuration
