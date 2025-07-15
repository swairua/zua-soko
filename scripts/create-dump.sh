#!/bin/bash

# Zuasoko Database Dump Script
echo "📦 Creating Zuasoko database dump..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set."
    echo "Please set DATABASE_URL in your .env file"
    exit 1
fi

# Create timestamp for dump file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="zuasoko_db_dump_${TIMESTAMP}.sql"

# Create database dump
echo "Creating dump file: $DUMP_FILE"
pg_dump $DATABASE_URL > $DUMP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Database dump created successfully: $DUMP_FILE"
    echo "📊 File size: $(du -h $DUMP_FILE | cut -f1)"
else
    echo "❌ Failed to create database dump"
    exit 1
fi

# Create latest dump (overwrite previous)
cp $DUMP_FILE zuasoko_db_dump_latest.sql
echo "📋 Latest dump saved as: zuasoko_db_dump_latest.sql"

echo ""
echo "🔄 To restore this dump on another system:"
echo "psql \$DATABASE_URL < $DUMP_FILE"
