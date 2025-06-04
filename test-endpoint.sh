#!/bin/bash

# Test endpoint POST /api/books
# Note: You need to authenticate first and get a proper session token

echo "Testing POST /api/books endpoint..."
echo "=================================="

# Test 1: Valid book creation
echo "Test 1: Creating a valid book"
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "9780132350884",
    "description": "A handbook of agile software craftsmanship",
    "status": "want_to_read",
    "rating": 5,
    "tags": ["programming", "software-engineering"]
  }' | jq .

echo -e "\n\n"

# Test 2: Invalid validation - missing required fields
echo "Test 2: Missing required fields (should fail)"
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "9780132350884"
  }' | jq .

echo -e "\n\n"

# Test 3: Invalid validation - too many tags
echo "Test 3: Too many tags (should fail)"
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book",
    "author": "Test Author",
    "tags": ["tag1", "tag2", "tag3", "tag4"]
  }' | jq .

echo -e "\n\n"

# Test 4: Invalid JSON
echo "Test 4: Invalid JSON (should fail)"
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book"
    "author": "Missing comma"
  }' | jq .

echo -e "\n\nTests completed!"
echo "Note: Authentication tests will require proper session tokens" 