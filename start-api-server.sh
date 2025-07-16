#!/bin/bash
echo "🚀 Starting API server on port 5001..."
export DATABASE_URL="postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db"
node dev-server-combined.js
