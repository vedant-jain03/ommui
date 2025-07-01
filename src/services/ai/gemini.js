// src/services/ai/gemini.js
import { AIServiceBase } from "./base";

export class GeminiService extends AIServiceBase {
  constructor(config) {
    super(config);
    // Use the correct model name format
    const modelName = config.model || "gemini-2.0-flash";
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
  }

  async sendMessage(messages, options = {}) {
    try {
      // Convert messages to Gemini format
      const contents = this.formatMessages(messages);

      const response = await fetch(`${this.apiUrl}?key=${this.config.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 1,
            topP: options.topP || 1,
            maxOutputTokens: options.maxTokens || 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE",
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Gemini API error:", error);

        if (error.error?.message?.includes("API key")) {
          throw new Error(
            "Invalid API key. Get your free key at: makersuite.google.com/app/apikey"
          );
        } else if (error.error?.status === "RESOURCE_EXHAUSTED") {
          throw new Error("Rate limit exceeded. Wait a moment and try again.");
        }

        throw new Error(error.error?.message || "Gemini API error");
      }

      const data = await response.json();

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          content: data.candidates[0].content.parts[0].text,
          usage: {
            prompt_tokens: data.usageMetadata?.promptTokenCount,
            completion_tokens: data.usageMetadata?.candidatesTokenCount,
            total_tokens: data.usageMetadata?.totalTokenCount,
          },
          model: this.config.model || "gemini-2.0-flash",
        };
      } else {
        throw new Error("No response generated");
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }

  formatMessages(messages) {
    // Gemini uses a different format - need to group consecutive messages by role
    const contents = [];
    let currentRole = null;
    let currentParts = [];

    for (const msg of messages) {
      const geminiRole = msg.role === "assistant" ? "model" : "user";

      if (geminiRole !== currentRole && currentParts.length > 0) {
        contents.push({
          role: currentRole,
          parts: currentParts,
        });
        currentParts = [];
      }

      currentRole = geminiRole;
      currentParts.push({ text: msg.content });
    }

    if (currentParts.length > 0) {
      contents.push({
        role: currentRole,
        parts: currentParts,
      });
    }

    return contents;
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.apiUrl}?key=${this.config.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: 'Say "OK" in one word.' }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 10,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.error?.message || "Connection failed",
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected to ${this.config.model || "gemini-2.0-flash"}!`,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Gemini doesn't support streaming in the same way, but we can implement it later
  async handleStream(response) {
    throw new Error("Streaming not yet implemented for Gemini");
  }

  // Helper method to list available models
  async listModels() {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${this.config.apiKey}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();
      console.log(
        "Available Gemini models:",
        data.models?.map((m) => m.name)
      );
      return data.models;
    } catch (error) {
      console.error("Error listing models:", error);
      return [];
    }
  }
}
