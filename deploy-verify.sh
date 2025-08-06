#!/bin/bash

# Zuasoko Production Deployment Verification Script
echo "🔍 Verifying Zuasoko Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get app URL
if command -v fly &> /dev/null && fly auth whoami &> /dev/null; then
    APP_URL="https://$(fly info --json | grep hostname | cut -d'"' -f4 2>/dev/null)"
    echo "🌐 App URL: $APP_URL"
else
    echo "⚠️  Fly CLI not available. Please provide your app URL:"
    read -p "Enter your app URL (e.g., https://your-app.fly.dev): " APP_URL
fi

if [ -z "$APP_URL" ]; then
    echo "❌ No app URL provided. Exiting."
    exit 1
fi

echo ""
echo "🧪 Testing Production Endpoints..."
echo "=================================="

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    
    echo -n "Testing $name... "
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$url" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
        return 1
    fi
}

# Array to track test results
passed=0
failed=0

# Core endpoints
echo ""
echo "🔧 Core System Tests:"
test_endpoint "Health Check" "$APP_URL/health" && ((passed++)) || ((failed++))
test_endpoint "API Status" "$APP_URL/api/status" && ((passed++)) || ((failed++))
test_endpoint "Main Page" "$APP_URL/" && ((passed++)) || ((failed++))

# Admin endpoints
echo ""
echo "👥 Admin API Tests:"
test_endpoint "Admin Users" "$APP_URL/api/admin/users" && ((passed++)) || ((failed++))
test_endpoint "Admin Analytics" "$APP_URL/api/admin/analytics/stats" && ((passed++)) || ((failed++))
test_endpoint "Admin Activity" "$APP_URL/api/admin/activity" && ((passed++)) || ((failed++))
test_endpoint "Admin Settings" "$APP_URL/api/admin/settings" && ((passed++)) || ((failed++))

# Registration fees endpoints
echo ""
echo "💰 Registration Fees Tests:"
test_endpoint "Unpaid Farmers" "$APP_URL/api/admin/registration-fees/unpaid" && ((passed++)) || ((failed++))
test_endpoint "Registration Settings" "$APP_URL/api/admin/registration-fees/settings" && ((passed++)) || ((failed++))

# STK Push test with mock data
echo -n "Testing STK Push... "
stk_data='{"farmer_id":"test-farmer","phone_number":"+254712345678","amount":1000}'
test_endpoint "STK Push" "$APP_URL/api/admin/registration-fees/stk-push" "POST" "$stk_data" && ((passed++)) || ((failed++))

# Marketplace endpoints
echo ""
echo "🛍️ Marketplace Tests:"
test_endpoint "Products" "$APP_URL/api/products" && ((passed++)) || ((failed++))
test_endpoint "Categories" "$APP_URL/api/marketplace/categories" && ((passed++)) || ((failed++))
test_endpoint "Counties" "$APP_URL/api/marketplace/counties" && ((passed++)) || ((failed++))

# Test pages
echo ""
echo "📄 Page Tests:"
test_endpoint "Status Page" "$APP_URL/status.html" && ((passed++)) || ((failed++))
test_endpoint "Admin Dashboard" "$APP_URL/admin.html" && ((passed++)) || ((failed++))
test_endpoint "Registration Test" "$APP_URL/registration-test.html" && ((passed++)) || ((failed++))

# Summary
echo ""
echo "📊 Test Summary:"
echo "=================================="
echo -e "✅ Passed: ${GREEN}$passed${NC}"
echo -e "❌ Failed: ${RED}$failed${NC}"
total=$((passed + failed))
echo "📈 Total: $total"

if [ $failed -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Your deployment is working correctly.${NC}"
    echo ""
    echo "🔗 Quick Links:"
    echo "   • Admin Dashboard: $APP_URL/admin.html"
    echo "   • API Status: $APP_URL/status.html"
    echo "   • Registration Fees: $APP_URL/registration-test.html"
    echo ""
    echo "✨ The Network Error issues should now be resolved!"
else
    echo ""
    echo -e "${YELLOW}⚠️  Some tests failed. Check the logs:${NC}"
    echo "   fly logs"
    echo ""
    echo "🔧 Common fixes:"
    echo "   • Verify environment variables: fly secrets list"
    echo "   • Check database connection"
    echo "   • Ensure latest code is deployed"
fi

exit $failed
