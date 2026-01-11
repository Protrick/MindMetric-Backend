# Stress State Email Tracking

## Overview

The backend now implements **smart email notification** that prevents duplicate stress alerts. Emails are sent **only when stress transitions from `false` to `true`**, not on every stress report.

## How It Works

### State Tracking

- The system maintains an in-memory state tracker for each user (by email)
- Tracks the last stress state: `true` or `false`
- Automatically cleans up old entries (24+ hours) to prevent memory leaks

### Email Sending Logic

```
Current State    Previous State    Action
─────────────────────────────────────────────────
stress: true     (no state)       ✅ SEND EMAIL
stress: true     false            ✅ SEND EMAIL
stress: true     true             ❌ NO EMAIL (already notified)
stress: false    true             ❌ NO EMAIL (recovered, reset state)
stress: false    false            ❌ NO EMAIL (still not stressed)
```

## Example Scenario

```bash
# User starts experiencing stress
POST /api/stress/report { stress: true }   # ✅ Email sent

# User continues to be stressed (multiple readings)
POST /api/stress/report { stress: true }   # ❌ No email
POST /api/stress/report { stress: true }   # ❌ No email
POST /api/stress/report { stress: true }   # ❌ No email

# User recovers
POST /api/stress/report { stress: false }  # ❌ No email (state reset)

# User experiences stress again later
POST /api/stress/report { stress: true }   # ✅ Email sent (new stress episode)
```

## Benefits

1. **Prevents Email Spam**: Users won't receive dozens of emails during a single stress episode
2. **Meaningful Alerts**: Only notified when stress _starts_, not while it continues
3. **Automatic Recovery**: When stress becomes false, the system automatically resets for the next episode
4. **Memory Efficient**: Old states are cleaned up every hour

## Testing

Run the comprehensive test script:

```bash
./test-stress-tracking.sh
```

This will demonstrate:

- First stress detection (email sent)
- Repeated stress reports (no duplicate emails)
- Recovery (state reset)
- New stress episode (email sent again)

## Implementation Files

- **Tracker**: `src/utils/stressStateTracker.js` - State management
- **Controller**: `src/controllers/stressController.js` - HTTP endpoint logic
- **Socket**: `src/socket/stressSocket.js` - WebSocket event logic

## API Behavior

### HTTP Endpoint: `POST /api/stress/report`

### Socket Event: `stressDetected`

Both implementations use the same state tracking logic to ensure consistent behavior across HTTP and WebSocket interfaces.

## Notes

- State is tracked **per email address**
- State persists for 24 hours (auto-cleanup)
- State is in-memory (resets on server restart)
- Works for both authenticated and unauthenticated users
- FCM notifications follow the same logic as email

## Future Enhancements (Optional)

- Persist state to database for server restart resilience
- Configurable cooldown period (e.g., don't send again for X minutes)
- Admin dashboard to view/reset user stress states
- Different thresholds for different stress levels
