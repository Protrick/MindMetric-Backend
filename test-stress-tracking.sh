#!/bin/bash

# Test Stress State Email Tracking
# This demonstrates that emails are only sent when stress transitions from false -> true

echo "========================================="
echo "Testing Stress State Email Tracking"
echo "========================================="
echo ""

BASE_URL="http://localhost:3000/api/stress/report"
EMAIL="tracker-test@example.com"

echo "📧 Email will be sent ONLY when stress changes from false -> true"
echo ""

# Test 1: First stress=true (should send email)
echo "Test 1: First stress=true report"
echo "Expected: ✅ Email SENT (initial stress detection)"
curl -sS -X POST $BASE_URL -H "Content-Type: application/json" -d "{
  \"name\":\"Tracker Test\",
  \"email\":\"$EMAIL\",
  \"heart_rate\":130,
  \"temp\":37.5,
  \"rms\":0.88,
  \"zcr\":0.45,
  \"stress\":true
}" | jq -c '{message, stress: .report.stress}'
echo ""
sleep 2

# Test 2: stress=true again (should NOT send email)
echo "Test 2: Second stress=true report (still stressed)"
echo "Expected: ❌ Email NOT sent (stress was already true)"
curl -sS -X POST $BASE_URL -H "Content-Type: application/json" -d "{
  \"name\":\"Tracker Test\",
  \"email\":\"$EMAIL\",
  \"heart_rate\":135,
  \"temp\":37.8,
  \"rms\":0.90,
  \"zcr\":0.48,
  \"stress\":true
}" | jq -c '{message, stress: .report.stress}'
echo ""
sleep 2

# Test 3: stress=true third time (should NOT send email)
echo "Test 3: Third stress=true report (still stressed)"
echo "Expected: ❌ Email NOT sent (stress still true)"
curl -sS -X POST $BASE_URL -H "Content-Type: application/json" -d "{
  \"name\":\"Tracker Test\",
  \"email\":\"$EMAIL\",
  \"heart_rate\":138,
  \"temp\":38.0,
  \"rms\":0.91,
  \"zcr\":0.49,
  \"stress\":true
}" | jq -c '{message, stress: .report.stress}'
echo ""
sleep 2

# Test 4: stress=false (resets the state, no email)
echo "Test 4: stress=false report (recovering)"
echo "Expected: ❌ Email NOT sent (stress is false, but state reset)"
curl -sS -X POST $BASE_URL -H "Content-Type: application/json" -d "{
  \"name\":\"Tracker Test\",
  \"email\":\"$EMAIL\",
  \"heart_rate\":85,
  \"temp\":36.5,
  \"rms\":0.65,
  \"zcr\":0.35,
  \"stress\":false
}" | jq -c '{message, stress: .report.stress}'
echo ""
sleep 2

# Test 5: stress=true after recovery (should send email again)
echo "Test 5: stress=true after recovery"
echo "Expected: ✅ Email SENT (stress changed from false -> true)"
curl -sS -X POST $BASE_URL -H "Content-Type: application/json" -d "{
  \"name\":\"Tracker Test\",
  \"email\":\"$EMAIL\",
  \"heart_rate\":140,
  \"temp\":38.2,
  \"rms\":0.93,
  \"zcr\":0.51,
  \"stress\":true
}" | jq -c '{message, stress: .report.stress}'
echo ""
sleep 2

# Test 6: stress=true again (should NOT send email)
echo "Test 6: stress=true again after email"
echo "Expected: ❌ Email NOT sent (stress still true)"
curl -sS -X POST $BASE_URL -H "Content-Type: application/json" -d "{
  \"name\":\"Tracker Test\",
  \"email\":\"$EMAIL\",
  \"heart_rate\":142,
  \"temp\":38.3,
  \"rms\":0.94,
  \"zcr\":0.52,
  \"stress\":true
}" | jq -c '{message, stress: .report.stress}'
echo ""

echo "========================================="
echo "✅ Test Complete!"
echo ""
echo "Summary:"
echo "- Email sent when: stress changes from false -> true"
echo "- Email NOT sent when: stress remains true"
echo "- Email NOT sent when: stress is false"
echo "- State resets when: stress becomes false"
echo "========================================="
