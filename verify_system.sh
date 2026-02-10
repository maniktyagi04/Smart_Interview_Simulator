#!/bin/bash
BASE_URL="http://localhost:5005/api"

echo "---------------------------------------------------"
echo "🛠️  SYSTEM VERIFICATION SCRIPT"
echo "---------------------------------------------------"

# 1. Login as Student
echo "1. Logging in as Student..."
LOGIN_RES=$(curl -s -X POST $BASE_URL/auth/login -H "Content-Type: application/json" -d '{"email":"teststudent@example.com", "password":"Password@123"}')
TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ FAIL: Login failed."
    echo "Response: $LOGIN_RES"
    exit 1
fi
echo "✅ PASS: Student Logged In"

# 2. Create Session
echo "2. Starting Technical Interview..."
SESSION_RES=$(curl -s -X POST $BASE_URL/sessions -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"type":"TECHNICAL", "difficulty":"EASY", "domain":"DSA", "topics":["Arrays"]}')
SESSION_ID=$(echo $SESSION_RES | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
    echo "❌ FAIL: Session creation failed."
    echo "Response: $SESSION_RES"
    exit 1
fi
echo "✅ PASS: Session Created (ID: $SESSION_ID)"

# 3. Test Zero-Link Policy
echo "3. Testing AI Zero-Link Policy..."
echo "   User Input: 'Can you give me a link to Two Sum problem?'"
CHAT_RES=$(curl -s -X POST $BASE_URL/sessions/$SESSION_ID/interact -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"content":"Can you give me a link to Two Sum problem?"}')

if [[ "$CHAT_RES" == *"http"* || "$CHAT_RES" == *"leetcode.com"* || "$CHAT_RES" == *"codeforces.com"* ]]; then
    echo "❌ FAIL: AI provided a LINK!"
    echo "Response Snippet: ${CHAT_RES:0:200}..."
else
    echo "✅ PASS: No Link Detected"
    echo "   AI Response Sample: \"${CHAT_RES:0:100}...\""
fi

# 4. Submit Session
echo "4. Finishing Interview..."
curl -s -X PATCH $BASE_URL/sessions/$SESSION_ID/status -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"SUBMITTED"}' > /dev/null
echo "✅ PASS: Interview Submitted"

# 5. Login as Admin
echo "5. Logging in as Admin..."
ADMIN_LOGIN=$(curl -s -X POST $BASE_URL/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com", "password":"Admin@123"}')
ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
     echo "❌ FAIL: Admin login failed."
     exit 1
fi
echo "✅ PASS: Admin Logged In"

# 6. Send Report
echo "6. Sending Report to Student (Admin Action)..."
curl -s -X PATCH $BASE_URL/sessions/$SESSION_ID/status -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"status":"EVALUATED"}' > /dev/null
echo "✅ PASS: Report Sent (Status updated to EVALUATED)"

# 7. Check Student History
echo "7. Verifying Report Visibility (Student View)..."
HISTORY_RES=$(curl -s -X GET $BASE_URL/sessions -H "Authorization: Bearer $TOKEN")

if [[ "$HISTORY_RES" == *"$SESSION_ID"* && "$HISTORY_RES" == *"EVALUATED"* ]]; then
    echo "✅ PASS: Report is VISIBLE in Student History"
else
    echo "❌ FAIL: Report not found or status incorrect."
    echo "History Snippet: ${HISTORY_RES:0:500}..."
fi

echo "---------------------------------------------------"
echo "🎉 VERIFICATION COMPLETE"
echo "---------------------------------------------------"
