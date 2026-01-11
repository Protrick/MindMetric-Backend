/**
 * Stress State Tracker
 * Tracks the previous stress state per user to prevent duplicate email notifications
 * Email is sent only when stress transitions from false -> true
 */

class StressStateTracker {
  constructor() {
    // Store: { email: { lastStress: boolean, timestamp: number } }
    this.stressStates = new Map();

    // Clean up old entries every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  /**
   * Check if email should be sent based on stress state transition
   * @param {string} email - User email
   * @param {boolean} currentStress - Current stress value
   * @returns {boolean} - true if email should be sent
   */
  shouldSendEmail(email, currentStress) {
    if (!email) return false;

    // Only send email when stress is true
    if (!currentStress) {
      // Update state to false, but don't send email
      this.stressStates.set(email, {
        lastStress: false,
        timestamp: Date.now(),
      });
      return false;
    }

    // Check previous state
    const previousState = this.stressStates.get(email);

    // If no previous state OR previous was false, send email
    if (!previousState || previousState.lastStress === false) {
      this.stressStates.set(email, {
        lastStress: true,
        timestamp: Date.now(),
      });
      return true;
    }

    // Previous was true, current is true -> don't send again
    return false;
  }

  /**
   * Manually reset stress state for a user (optional)
   * @param {string} email - User email
   */
  resetState(email) {
    this.stressStates.delete(email);
  }

  /**
   * Clean up entries older than 24 hours
   */
  cleanup() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    for (const [email, state] of this.stressStates.entries()) {
      if (state.timestamp < oneDayAgo) {
        this.stressStates.delete(email);
      }
    }
  }

  /**
   * Get current state for debugging
   */
  getState(email) {
    return this.stressStates.get(email) || null;
  }
}

// Singleton instance
const stressStateTracker = new StressStateTracker();

module.exports = stressStateTracker;
