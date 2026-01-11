const { messaging, firebaseInitialized } = require("../firebase");

async function sendStressNotification({ token, title, body, data = {} }) {
  if (!firebaseInitialized || !messaging) {
    throw new Error("Firebase messaging not initialized");
  }

  const message = { token, notification: { title, body }, data };
  const response = await messaging.send(message);
  return response;
}

module.exports = { sendStressNotification };
