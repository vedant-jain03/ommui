// src/composables/useChat.js
import { ref, computed } from "vue";
import { useConfigStore } from "@/stores/config";
import { useChatStore } from "@/stores/chat";
import { createAIService } from "@/services/ai";

export function useChat() {
  const configStore = useConfigStore();
  const chatStore = useChatStore();

  const isLoading = ref(false);
  const error = ref(null);
  const streamingMessage = ref("");

  // Get current AI service
  const aiService = computed(() => {
    if (!configStore.hasActiveProvider) return null;

    const provider = configStore.activeProvider;
    const config = configStore.providers[provider];

    return createAIService(provider, config);
  });

  // Send a message
  async function sendMessage(content) {
    if (!aiService.value) {
      error.value = "No AI provider configured";
      return;
    }

    error.value = null;
    isLoading.value = true;
    streamingMessage.value = "";

    try {
      // Add user message
      await chatStore.addMessage({
        role: "user",
        content,
      });

      // Get conversation context
      const messages = chatStore.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Get decrypted API key
      const decryptedConfig = {
        ...configStore.providers[configStore.activeProvider],
        apiKey: await configStore.getDecryptedKey(configStore.activeProvider),
      };

      // Create service with decrypted key
      const service = createAIService(
        configStore.activeProvider,
        decryptedConfig
      );

      // Check if streaming is enabled AND provider supports it
      const supportsStreaming = configStore.activeProvider === "openai";
      const shouldStream =
        configStore.preferences.streamResponses && supportsStreaming;

      if (shouldStream) {
        // Handle streaming response (OpenAI only for now)
        const stream = await service.sendMessage(messages, { stream: true });

        let fullContent = "";
        for await (const chunk of stream) {
          fullContent += chunk;
          streamingMessage.value = fullContent;
        }

        // Add complete message to store
        await chatStore.addMessage({
          role: "assistant",
          content: fullContent,
        });

        streamingMessage.value = "";
      } else {
        // Handle non-streaming response
        const response = await service.sendMessage(messages);

        await chatStore.addMessage({
          role: "assistant",
          content: response.content,
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      error.value = err.message;

      // Add error message to chat
      await chatStore.addMessage({
        role: "assistant",
        content: `Error: ${err.message}`,
        isError: true,
      });
    } finally {
      isLoading.value = false;
    }
  }

  // Test current provider connection
  async function testConnection() {
    if (!aiService.value) {
      return { success: false, message: "No provider configured" };
    }

    try {
      const decryptedConfig = {
        ...configStore.providers[configStore.activeProvider],
        apiKey: await configStore.getDecryptedKey(configStore.activeProvider),
      };

      const service = createAIService(
        configStore.activeProvider,
        decryptedConfig
      );
      return await service.testConnection();
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // Regenerate last response
  async function regenerateLastResponse() {
    const lastUserMessageIndex = chatStore.messages.findLastIndex(
      (m) => m.role === "user"
    );
    if (lastUserMessageIndex === -1) return;

    // Remove all messages after the last user message
    chatStore.messages = chatStore.messages.slice(0, lastUserMessageIndex + 1);

    // Resend the last user message
    const lastUserMessage = chatStore.messages[lastUserMessageIndex];
    await sendMessage(lastUserMessage.content);
  }

  return {
    isLoading,
    error,
    streamingMessage,
    sendMessage,
    testConnection,
    regenerateLastResponse,
  };
}
