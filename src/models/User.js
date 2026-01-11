const { db } = require("../config/firebase");

class User {
  static collectionRef = "users";

  // Create a user record
  static async create(userData) {
    const { name, email, provider, googleId, deviceToken } = userData;
    const newUserRef = db.ref(this.collectionRef).push();
    const userId = newUserRef.key;

    const user = {
      name,
      email,
      provider: provider || "google",
      googleId: googleId || null,
      deviceToken: deviceToken || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await newUserRef.set(user);

    return { id: userId, ...user };
  }

  static async findByEmail(email) {
    if (!email) return null;
    const snapshot = await db
      .ref(this.collectionRef)
      .orderByChild("email")
      .equalTo(email)
      .limitToFirst(1)
      .once("value");

    if (!snapshot.exists()) return null;

    const data = snapshot.val();
    const userId = Object.keys(data)[0];
    return { id: userId, ...data[userId] };
  }

  static async findByGoogleId(googleId) {
    if (!googleId) return null;
    const snapshot = await db
      .ref(this.collectionRef)
      .orderByChild("googleId")
      .equalTo(googleId)
      .limitToFirst(1)
      .once("value");

    if (!snapshot.exists()) return null;

    const data = snapshot.val();
    const userId = Object.keys(data)[0];
    return { id: userId, ...data[userId] };
  }

  static async findById(id) {
    const snapshot = await db.ref(`${this.collectionRef}/${id}`).once("value");
    if (!snapshot.exists()) return null;
    return { id, ...snapshot.val() };
  }

  // Create or update a user coming from Google Sign-In
  static async createOrUpdateFromGoogle({
    googleId,
    name,
    email,
    deviceToken,
  }) {
    // Try find by googleId first
    let user = null;
    if (googleId) user = await this.findByGoogleId(googleId);

    // Fallback: match by email
    if (!user && email) user = await this.findByEmail(email);

    if (user) {
      const updates = {};
      if (!user.googleId && googleId) updates.googleId = googleId;
      if (name && name !== user.name) updates.name = name;
      if (deviceToken) updates.deviceToken = deviceToken;

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = Date.now();
        await db.ref(`${this.collectionRef}/${user.id}`).update(updates);
        return this.findById(user.id);
      }

      return user;
    }

    // Create new user
    return this.create({
      name,
      email,
      provider: "google",
      googleId,
      deviceToken,
    });
  }

  static async update(id, updates) {
    updates.updatedAt = Date.now();
    await db.ref(`${this.collectionRef}/${id}`).update(updates);
    return this.findById(id);
  }
}

module.exports = User;
