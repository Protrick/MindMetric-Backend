# MindMetric-Backend

Professional backend API for astronaut stress detection and monitoring. Built with Express.js, Socket.IO, Firebase, and AI-powered report generation.

## Features

- ✅ **Google Sign-In only** authentication (password-based auth removed)
- ✅ JWT-based authorization
- ✅ Device token storage for FCM push notifications
- ✅ Real-time stress detection via Socket.IO
- ✅ AI-powered stress reports (Google Gemini)
- ✅ Email notifications (SMTP/Gmail)
- ✅ Push notifications (FCM)
- ✅ Firestore database for reports
- ✅ RESTful API with proper MVC structure
- ✅ Input validation and error handling

## Project Structure

```
src/
├── config/           # Configuration files (Firebase, etc.)
├── controllers/      # Route controllers
├── middleware/       # Auth, validation middleware
├── models/           # Data models (User, StressReport)
├── routes/           # API routes
├── services/         # Business logic (email, FCM, AI)
├── socket/           # Socket.IO handlers
├── app.js            # Express app setup
└── server.js         # Server entry point
```

## Schema

### StressReport Model

- `name` (string) - Astronaut name
- `email` (string) - Astronaut email
- `heart_rate` (number) - Heart rate in bpm
- `temp` (number) - Body temperature
- `rms` (number) - Root Mean Square value
- `zcr` (number) - Zero Crossing Rate
- `is_stress` (boolean) - Stress detection flag
- `userId` (string, optional) - Associated user ID
- `readings` (object) - Raw sensor readings
- `modelSummary` (string) - ML model output summary
- `reportText` (string) - AI-generated report
- `createdAt` (timestamp) - Report creation time

### User Model

- `name` (string) - User full name
- `email` (string) - User email (unique)
- `provider` (string) - Auth provider (always "google")
- `googleId` (string) - Google user ID
- `deviceToken` (string, optional) - FCM device token for push notifications
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env` file (see `.env.example`):

```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/service-account.json

# Email (Gmail)
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
EMAIL_FROM="MindMetric <your-email@gmail.com>"

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Firebase Setup

1. Create Firebase project
2. Enable Firestore Database
3. Enable Cloud Messaging
4. Download service account JSON
5. Update `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env`

### 4. Start Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

## API Endpoints

### Authentication

#### Google Sign-In

Authenticate using Google credentials. Creates a new user if not exists, or returns existing user with JWT token.

```http
POST /api/auth/google-signin
Content-Type: application/json

{
  "googleId": "google-user-id-123",
  "name": "John Doe",
  "email": "john@example.com",
  "deviceToken": "fcm-device-token" (optional)
}
```

**Response:**

```json
{
  "message": "Sign-in successful",
  "user": {
    "id": "user-firestore-id",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "google",
    "googleId": "google-user-id-123",
    "deviceToken": "fcm-device-token"
  },
  "token": "jwt-token-here"
}
```

#### Get Profile (Protected)

```http
GET /api/auth/profile
Authorization: Bearer <your_jwt_token>
```

#### Update Device Token (Protected)

Update FCM device token for push notifications.

```http
PUT /api/auth/device-token
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "deviceToken": "new-fcm-device-token"
}
```

### Stress Reports

#### Create Stress Report

```http
POST /api/stress/report
Content-Type: application/json
Authorization: Bearer <token> (optional)

{
  "name": "John Doe",
  "email": "john@example.com",
  "heart_rate": 120,
  "temp": 37.5,
  "rms": 0.85,
  "zcr": 0.42,
  "is_stress": true,
  "modelSummary": "Elevated HR and temp detected",
  "authorityEmail": "authority@example.com",
  "fcmToken": "firebase_device_token"
}
```

#### Get My Reports (Protected)

```http
GET /api/stress/my-reports
Authorization: Bearer <your_jwt_token>
```

#### Get Specific Report

```http
GET /api/stress/reports/:id
Authorization: Bearer <token> (optional)
```

#### Get All Reports

```http
GET /api/stress/reports
```

### Health Check

```http
GET /api/health
```

## Socket.IO Events

### Connect

```javascript
const socket = io("http://localhost:3000");
```

### Emit Stress Detection

```javascript
socket.emit("stressDetected", {
  name: "John Doe",
  email: "john@example.com",
  heart_rate: 125,
  temp: 37.8,
  rms: 0.9,
  zcr: 0.5,
  is_stress: true,
  modelSummary: "High stress indicators",
  authorityEmail: "authority@example.com",
  userEmail: "user@example.com",
  fcmToken: "device_token",
  userId: "user_id_if_authenticated",
});
```

### Listen for Response

```javascript
socket.on("stressReportSent", (data) => {
  console.log("Report created:", data.reportId);
});

socket.on("stressReportError", (error) => {
  console.error("Error:", error);
});
```

## Testing

### Google Sign-In

```bash
curl -X POST http://localhost:3000/api/auth/google-signin \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "google-user-123",
    "name": "Test User",
    "email": "test@example.com",
    "deviceToken": "fcm-token-abc"
  }'
```

### Get Profile (with JWT token from sign-in response)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Device Token

```bash
curl -X PUT http://localhost:3000/api/auth/device-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "deviceToken": "new-fcm-token-xyz"
  }'
```

### Create Stress Report

```bash
curl -X POST http://localhost:3000/api/stress/report \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "heart_rate": 125,
    "temp": 37.5,
    "rms": 0.85,
    "zcr": 0.42,
    "is_stress": true,
    "modelSummary": "Test stress detected"
  }'
```

## Security Notes

- **Google Sign-In only** - no password storage
- JWT tokens expire after 7 days (configurable)
- Use strong `JWT_SECRET` in production
- Enable Firebase security rules
- Use HTTPS in production
- Rate limit API endpoints
- Validate all inputs
- Device tokens stored securely in Firestore

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Enable HTTPS
4. Configure Firebase security rules
5. Set up monitoring and logging
6. Use environment-specific configs
7. Enable CORS only for trusted domains

## License

ISC
