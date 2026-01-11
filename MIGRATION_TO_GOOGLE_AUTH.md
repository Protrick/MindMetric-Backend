# Migration to Google-Only Authentication

## Overview

This document summarizes the migration from password-based authentication to **Google Sign-In only** authentication system.

## Changes Made

### 1. **User Model** (`src/models/User.js`)

**Before:** Stored `name`, `email`, `password` (hashed)
**After:** Stores `name`, `email`, `provider`, `googleId`, `deviceToken`

**New Methods:**

- `findByGoogleId(googleId)` - Find user by Google ID
- `createOrUpdateFromGoogle({ googleId, name, email, deviceToken })` - Create or update user from Google auth

**Schema Changes:**

```javascript
{
  name: string,
  email: string,
  provider: "google",
  googleId: string,
  deviceToken: string | null,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2. **Auth Controller** (`src/controllers/authController.js`)

**Removed:**

- `register()` - Password-based registration
- `login()` - Password-based login

**Added:**

- `googleSignIn()` - Google OAuth sign-in
- `updateDeviceToken()` - Update FCM device token

**Removed Dependencies:**

- `bcryptjs` - No longer needed for password hashing

### 3. **Auth Routes** (`src/routes/authRoutes.js`)

**Before:**

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/profile`

**After:**

- POST `/api/auth/google-signin` - Google sign-in endpoint
- GET `/api/auth/profile` - Get user profile (protected)
- PUT `/api/auth/device-token` - Update device token (protected)

### 4. **Validation Middleware** (`src/middleware/validation.js`)

**Added:**

- `validateGoogleSignIn()` - Validates `googleId` and `email` required fields

**Deprecated (returns 410 Gone):**

- `validateRegistration()` - Returns error message to use Google Sign-In
- `validateLogin()` - Returns error message to use Google Sign-In

### 5. **App Configuration** (`src/app.js`)

Updated root endpoint (`GET /`) documentation to reflect new auth endpoints:

```json
{
  "auth": {
    "googleSignIn": "POST /api/auth/google-signin",
    "profile": "GET /api/auth/profile (protected)",
    "updateDeviceToken": "PUT /api/auth/device-token (protected)"
  }
}
```

### 6. **Documentation** (`README.md`)

**Updated sections:**

- Features - Added "Google Sign-In only" badge
- User schema - Replaced `password` with `googleId`, `provider`, `deviceToken`
- API endpoints - Replaced register/login with google-signin
- Testing examples - Updated curl commands
- Security notes - Removed bcrypt references, added device token security

### 7. **Dependencies** (`package.json`)

**Removed:**

- `bcryptjs` - No longer needed

**Kept:**

- `jsonwebtoken` - Still used for JWT token generation
- `firebase-admin` - Used for Firestore and FCM

## API Usage

### Google Sign-In Flow

1. **Client authenticates with Google** (handled by client app using Firebase Auth or Google OAuth)
2. **Client sends Google credentials to backend:**

```bash
POST /api/auth/google-signin
{
  "googleId": "google-user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "deviceToken": "fcm-token" (optional)
}
```

3. **Backend response:**

```json
{
  "message": "Sign-in successful",
  "user": {
    "id": "firestore-user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "google",
    "googleId": "google-user-id",
    "deviceToken": "fcm-token"
  },
  "token": "jwt-token-here"
}
```

4. **Client uses JWT token for protected endpoints:**

```bash
GET /api/auth/profile
Authorization: Bearer jwt-token-here
```

### Device Token Management

Update FCM device token (for push notifications):

```bash
PUT /api/auth/device-token
Authorization: Bearer jwt-token-here
{
  "deviceToken": "new-fcm-token"
}
```

## Breaking Changes

⚠️ **Warning:** This is a **breaking change** for existing clients.

### Deprecated Endpoints (return 410 Gone):

- POST `/api/auth/register` ❌
- POST `/api/auth/login` ❌

### Migration Path for Existing Users:

1. Existing users with password-based accounts need to re-authenticate using Google Sign-In
2. Old user records (with passwords) will be updated when they sign in with Google for the first time
3. The system matches by email and updates the record with `googleId` and sets `provider: "google"`

## Security Improvements

✅ No password storage or management
✅ Leverages Google's OAuth security
✅ Device token stored for FCM push notifications
✅ JWT tokens still used for API authorization
✅ Firestore security rules should be enabled

## Testing

### Test Google Sign-In:

```bash
curl -X POST http://localhost:3000/api/auth/google-signin \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "test-google-123",
    "name": "Test User",
    "email": "test@example.com",
    "deviceToken": "fcm-test-token"
  }'
```

## Next Steps

1. ✅ Update client apps to use Google Sign-In flow
2. ✅ Remove password fields from mobile/web forms
3. ✅ Test FCM push notifications with device tokens
4. ✅ Enable Firestore security rules
5. ✅ Update API documentation for clients
6. ⚠️ **Create Firestore database** in Firebase Console (if not already done)

## Rollback Plan

If needed, revert to password-based auth:

1. `git revert` or restore from backup
2. Run `npm install bcryptjs`
3. Restore old auth controller, routes, and validation
