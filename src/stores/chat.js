// src/stores/chat.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  saveConversation,
  getConversations,
  deleteConversation as deleteConversationDB,
  saveMessage,
  getMessages,
} from "@/utils/db";

export const useChatStore = defineStore("chat", () => {
  const conversations = ref([]);
  const currentConversationId = ref(null);
  const messages = ref([]);
  const isLoading = ref(false);

  // Computed
  const currentConversation = computed(() =>
    conversations.value.find((c) => c.id === currentConversationId.value)
  );

  // Load all conversations from DB
  async function loadConversations() {
    try {
      isLoading.value = true;
      const savedConversations = await getConversations();
      conversations.value = savedConversations.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      isLoading.value = false;
    }
  }

  // Create new conversation
  async function createConversation() {
    const id = Date.now().toString();
    const conversation = {
      id,
      title: "New Chat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      preview: "",
    };

    try {
      await saveConversation(conversation);
      conversations.value.unshift(conversation);
      await setCurrentConversation(id);
      return id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  // Switch to a conversation
  async function setCurrentConversation(conversationId) {
    if (currentConversationId.value === conversationId) return;

    try {
      isLoading.value = true;
      currentConversationId.value = conversationId;

      // Load messages for this conversation
      const conversationMessages = await getMessages(conversationId);
      messages.value = conversationMessages.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      isLoading.value = false;
    }
  }

  // Add message to current conversation
  async function addMessage(message) {
    if (!currentConversationId.value) {
      await createConversation();
    }

    const newMessage = {
      ...message,
      id: Date.now().toString(),
      conversationId: currentConversationId.value,
      timestamp: new Date().toISOString(),
    };

    try {
      // Add to store immediately for UI responsiveness
      messages.value.push(newMessage);

      // Save to DB
      await saveMessage(newMessage);

      // Update conversation metadata
      await updateConversationMetadata(newMessage);

      return newMessage;
    } catch (error) {
      // Rollback on error
      messages.value = messages.value.filter((m) => m.id !== newMessage.id);
      console.error("Error adding message:", error);
      throw error;
    }
  }

  // Update conversation title and preview based on messages
  async function updateConversationMetadata(message) {
    const conversation = currentConversation.value;
    if (!conversation) return;

    const updatedConversation = {
      ...conversation,
      updatedAt: new Date().toISOString(),
      messageCount: messages.value.length,
      preview: message.content.substring(0, 100) + "...",
    };

    // Auto-generate title from first user message if still "New Chat"
    if (
      conversation.title === "New Chat" &&
      message.role === "user" &&
      messages.value.length === 1
    ) {
      updatedConversation.title =
        message.content.substring(0, 50) +
        (message.content.length > 50 ? "..." : "");
    }

    try {
      await saveConversation(updatedConversation);
      const index = conversations.value.findIndex(
        (c) => c.id === conversation.id
      );
      if (index !== -1) {
        conversations.value[index] = updatedConversation;
      }
    } catch (error) {
      console.error("Error updating conversation metadata:", error);
    }
  }

  // Delete conversation
  async function deleteConversation(conversationId) {
    try {
      await deleteConversationDB(conversationId);
      conversations.value = conversations.value.filter(
        (c) => c.id !== conversationId
      );

      // If deleting current conversation, clear it
      if (currentConversationId.value === conversationId) {
        currentConversationId.value = null;
        messages.value = [];
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  }

  // Update message (for edits, regenerations, etc)
  async function updateMessage(messageId, updates) {
    const index = messages.value.findIndex((m) => m.id === messageId);
    if (index === -1) return;

    const updatedMessage = {
      ...messages.value[index],
      ...updates,
      editedAt: new Date().toISOString(),
    };

    try {
      messages.value[index] = updatedMessage;
      await saveMessage(updatedMessage);
    } catch (error) {
      console.error("Error updating message:", error);
      throw error;
    }
  }

  // Clear all data (for logout/reset)
  async function clearAllData() {
    // This would need to be implemented in db.js
    conversations.value = [];
    messages.value = [];
    currentConversationId.value = null;
  }

  return {
    // State
    conversations,
    currentConversationId,
    messages,
    isLoading,
    currentConversation,

    // Actions
    loadConversations,
    createConversation,
    setCurrentConversation,
    addMessage,
    updateMessage,
    deleteConversation,
    updateConversationMetadata,
    clearAllData,
  };
});
