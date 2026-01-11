const { messaging, firebaseInitialized } = require("../config/firebase");

async function sendStressNotification({ token, title, body, data = {} }) {
  if (!firebaseInitialized || !messaging) {
    throw new Error("Firebase messaging not initialized");
  }

  const message = {
    token,
    notification: { title, body },
    data,
  };

  const response = await messaging.send(message);
  console.log("✓ FCM sent:", response);
  return response;
}

module.exports = { sendStressNotification };
