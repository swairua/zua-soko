#!/bin/bash

echo "🏥 Zuasoko Health Check"
echo "======================="

# Check backend health
echo "🔍 Checking backend health..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend is healthy (HTTP $BACKEND_STATUS)"
else
    echo "❌ Backend is unhealthy (HTTP $BACKEND_STATUS)"
fi

# Check database connection
echo "🔍 Checking database connection..."
DB_STATUS=$(psql -h localhost -U caeybwbb_user -d caeybwbb_zuasoko_db -c "SELECT 1;" -t 2>/dev/null | xargs)
if [ "$DB_STATUS" = "1" ]; then
    echo "✅ Database connection is healthy"
else
    echo "❌ Database connection failed"
fi

# Check nginx status
echo "🔍 Checking nginx status..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is not running"
fi

# Check frontend accessibility
echo "🔍 Checking frontend accessibility..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://appzua.zuasoko.com)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is accessible (HTTP $FRONTEND_STATUS)"
else
    echo "❌ Frontend is not accessible (HTTP $FRONTEND_STATUS)"
fi

# Check SSL certificate
echo "🔍 Checking SSL certificate..."
SSL_EXPIRY=$(echo | openssl s_client -servername appzua.zuasoko.com -connect appzua.zuasoko.com:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)
if [ ! -z "$SSL_EXPIRY" ]; then
    echo "✅ SSL certificate is valid until: $SSL_EXPIRY"
else
    echo "❌ SSL certificate check failed"
fi

# Check disk space
echo "🔍 Checking disk space..."
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo "✅ Disk usage is normal ($DISK_USAGE%)"
else
    echo "⚠️  Disk usage is high ($DISK_USAGE%)"
fi

# Check memory usage
echo "🔍 Checking memory usage..."
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
echo "ℹ️  Memory usage: $MEMORY_USAGE%"

# Check if PM2 is managing processes
echo "🔍 Checking PM2 processes..."
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null)
    if [ "$PM2_STATUS" = "online" ]; then
        echo "✅ PM2 process is online"
    else
        echo "❌ PM2 process is not online"
    fi
else
    echo "ℹ️  PM2 is not installed"
fi

echo ""
echo "🎯 Quick Actions:"
echo "  View backend logs: pm2 logs zuasoko-backend"
echo "  Restart backend: pm2 restart zuasoko-backend"
echo "  Reload nginx: sudo nginx -s reload"
echo "  Check nginx logs: sudo tail -f /var/log/nginx/error.log"
