#!/bin/bash

echo "🚀 Quick test of POST /api/books endpoint"
echo "========================================="

# Simple curl test - will return 401 without proper auth
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Code", 
    "author": "Robert C. Martin"
  }' \
  -w "\n\n📊 Status: %{http_code}\n" \
  -s | jq .

echo "💡 Expected: 401 Unauthorized (needs Supabase auth)"
echo "✅ If you see validation error, endpoint is working!" 