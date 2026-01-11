# Firebase Realtime Database Setup

## ✅ Migration Complete

Successfully migrated from Firestore to Firebase Realtime Database.

## Configuration

### Environment Variables (`.env`)

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.region.firebasedatabase.app/
```

### Your Current Setup

- **Database URL:** `https://mindmetric-a6be9-default-rtdb.asia-southeast1.firebasedatabase.app/`
- **Region:** Asia Southeast 1
- **Service Account:** `/home/pratik/Downloads/firebase-service-account.json`

## Database Structure

### Users Collection (`/users`)

```json
{
  "users": {
    "user-push-id-1": {
      "name": "John Doe",
      "email": "john@example.com",
      "provider": "google",
      "googleId": "google-user-id-123",
      "deviceToken": "fcm-device-token",
      "createdAt": 1768112104423,
      "updatedAt": 1768112104423
    }
  }
}
```

### Stress Reports Collection (`/stress_reports`)

```json
{
  "stress_reports": {
    "report-push-id-1": {
      "userId": "user-push-id-1",
      "name": "John Doe",
      "email": "john@example.com",
      "heart_rate": 125,
      "temp": 37.5,
      "rms": 0.85,
      "zcr": 0.42,
      "is_stress": true,
      "readings": {
        "heart_rate": 125,
        "temp": 37.5,
        "rms": 0.85,
        "zcr": 0.42
      },
      "modelSummary": "Elevated HR detected",
      "reportText": "AI-generated report text...",
      "createdAt": 1768112104423
    }
  }
}
```

## 🔥 **REQUIRED: Database Rules & Indexes**

### Step 1: Go to Firebase Console

1. Open: https://console.firebase.google.com/project/mindmetric-a6be9/database
2. Click **"Rules"** tab

### Step 2: Add These Rules

**For Development (Permissive - WARNING: Not for production!):**

```json
{
  "rules": {
    "users": {
      ".read": true,
      ".write": true,
      ".indexOn": ["email", "googleId"]
    },
    "stress_reports": {
      ".read": true,
      ".write": true,
      ".indexOn": ["userId", "email", "createdAt"]
    }
  }
}
```

**For Production (Authenticated Access):**

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["email", "googleId"]
    },
    "stress_reports": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["userId", "email", "createdAt"]
    }
  }
}
```

### Why Indexes Are Required

The app uses `orderByChild().equalTo()` queries which REQUIRE indexes for:

- **Users:** `email`, `googleId` (for finding users by email or Google ID)
- **Stress Reports:** `userId`, `email`, `createdAt` (for filtering and sorting reports)

**Without indexes:** Queries will be slow and you'll see Firebase warnings in logs.

## Test Results

### ✅ Tested and Working

**Test 1: Google Sign-In**

```bash
curl -X POST http://localhost:3000/api/auth/google-signin \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "gid-rtdb-test-123",
    "name": "RTDB Test User",
    "email": "rtdbtest@example.com",
    "deviceToken": "devtoken-xyz"
  }'
```

**Response:**

```json
{
  "message": "Sign-in successful",
  "user": {
    "id": "-OifgPE5jwfSc0kOvbBo",
    "name": "RTDB Test User",
    "email": "rtdbtest@example.com",
    "provider": "google",
    "googleId": "gid-rtdb-test-123",
    "deviceToken": "devtoken-xyz",
    "createdAt": 1768112104423,
    "updatedAt": 1768112104423
  },
  "token": "eyJhbGc..."
}
```

**Test 2: Database Verification**

```bash
node -r dotenv/config -e "
  const { db } = require('./src/config/firebase');
  db.ref('users')
    .orderByChild('email')
    .equalTo('rtdbtest@example.com')
    .once('value')
    .then(s => console.log(s.val()));
"
```

✅ User successfully saved and retrieved from Realtime Database!

## Code Changes Summary

### Files Modified:

1. **`src/config/firebase.js`** - Changed from Firestore to Realtime Database

   - Removed: `getFirestore()`
   - Added: `admin.database()` with `databaseURL`

2. **`src/models/User.js`** - Converted all Firestore queries to RTDB

   - `.collection().add()` → `.ref().push().set()`
   - `.where().get()` → `.orderByChild().equalTo().once('value')`
   - `.doc().get()` → `.ref(path).once('value')`

3. **`src/models/StressReport.js`** - Converted to RTDB queries

   - Same pattern as User model

4. **`src/socket/stressSocket.js`** - Updated comment (Firestore → RTDB)
5. **`src/controllers/stressController.js`** - Updated comment (Firestore → RTDB)

### Dependencies:

- ✅ `firebase-admin` - Already includes both Firestore and RTDB support
- ❌ No additional packages needed

## Performance Notes

### Timestamps

- Using `Date.now()` (milliseconds since epoch) instead of Firestore Timestamp
- Easy to sort and compare
- Converts to ISO string: `new Date(timestamp).toISOString()`

### Query Limitations

- Realtime Database only supports **one** `orderByChild()` per query
- Cannot do complex compound queries like Firestore
- Workaround: Filter on server after fetching, or denormalize data

### Data Denormalization

Consider denormalizing for better performance:

```json
{
  "userReports": {
    "user-id-1": {
      "report-id-1": true,
      "report-id-2": true
    }
  }
}
```

## Security Recommendations

1. **Add indexes immediately** (see rules above)
2. **Never use `.read: true, .write: true` in production**
3. **Use Firebase Authentication tokens** for secure access
4. **Add validation rules** to prevent invalid data
5. **Set up Firebase App Check** to prevent abuse

## Next Steps

- [ ] Add database rules with indexes in Firebase Console
- [ ] Test all endpoints with the updated database
- [ ] Update README.md with RTDB setup instructions
- [ ] Consider adding more denormalized data structures for complex queries
- [ ] Set up Firebase security rules for production

## Troubleshooting

### Error: "Can't determine Firebase Database URL"

- **Solution:** Add `FIREBASE_DATABASE_URL` to `.env`

### Warning: "Using an unspecified index"

- **Solution:** Add `.indexOn` rules in Firebase Console

### Error: "Permission denied"

- **Solution:** Update database rules to allow read/write access

## Resources

- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Database Rules Reference](https://firebase.google.com/docs/database/security)
- [Structuring Data Guide](https://firebase.google.com/docs/database/web/structure-data)
