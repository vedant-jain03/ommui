import { AIServiceBase } from "./base";

export class OpenAIService extends AIServiceBase {
  constructor(config) {
    super(config);
    this.apiUrl = "https://api.openai.com/v1/chat/completions";
  }

  async sendMessage(messages, options = {}) {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || "gpt-4-turbo-preview",
          messages: this.formatMessages(messages),
          temperature: options.temperature || 0.7,
          stream: options.stream || false,
          ...options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("OpenAI API Error:", error);

        // Better error messages
        if (error.error?.code === "insufficient_quota") {
          throw new Error(
            "OpenAI API quota exceeded. Please check your billing at https://platform.openai.com/account/billing"
          );
        } else if (error.error?.code === "invalid_api_key") {
          throw new Error(
            "Invalid API key. Please check your key in settings."
          );
        } else if (error.error?.message?.includes("model")) {
          throw new Error(
            `Model error: ${error.error.message}. Try using gpt-3.5-turbo instead.`
          );
        }

        throw new Error(error.error?.message || "OpenAI API error");
      }

      if (options.stream) {
        return this.handleStream(response);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        usage: data.usage,
        model: data.model,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }

  async handleStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return {
      async *[Symbol.asyncIterator]() {
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") return;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) yield content;
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      },
    };
  }

  formatMessages(messages) {
    // Convert from our format to OpenAI format
    return messages.map((msg) => ({
      role: msg.role, // 'user', 'assistant', 'system'
      content: msg.content,
    }));
  }

  async testConnection() {
    try {
      // Use the cheapest model for testing
      const testConfig = {
        ...this.config,
        model: "gpt-3.5-turbo",
      };

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: testConfig.model,
          messages: [{ role: "user", content: 'Say "OK" in one word.' }],
          max_tokens: 5,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Test connection error:", error);

        if (error.error?.code === "insufficient_quota") {
          return {
            success: false,
            message:
              "No OpenAI credits. Add billing at: platform.openai.com/account/billing",
          };
        }

        return {
          success: false,
          message: error.error?.message || "Connection failed",
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected! Using ${data.model}`,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
