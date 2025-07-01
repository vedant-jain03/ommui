export class AIServiceBase {
  constructor(config) {
    this.config = config;
  }

  // Must be implemented by subclasses
  async sendMessage(messages, options = {}) {
    throw new Error("sendMessage must be implemented by subclass");
  }

  async testConnection() {
    throw new Error("testConnection must be implemented by subclass");
  }

  // Helper to format messages for the specific API
  formatMessages(messages) {
    throw new Error("formatMessages must be implemented by subclass");
  }
}
