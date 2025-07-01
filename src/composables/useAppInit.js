import { ref, onMounted } from "vue";
import { useConfigStore } from "@/stores/config";
import { useChatStore } from "@/stores/chat";

export function useAppInit() {
  const isInitialized = ref(false);
  const initError = ref(null);

  const configStore = useConfigStore();
  const chatStore = useChatStore();

  async function initializeApp() {
    try {
      console.log("Initializing app...");

      // Load config from IndexedDB
      await configStore.loadFromDB();
      console.log("Config loaded");

      // Load conversations
      await chatStore.loadConversations();
      console.log("Conversations loaded");

      // If no conversations exist, create a default one
      if (chatStore.conversations.length === 0) {
        await chatStore.createConversation();
      }

      isInitialized.value = true;
      console.log("App initialized successfully");
    } catch (error) {
      console.error("Failed to initialize app:", error);
      initError.value = error.message;
    }
  }

  onMounted(() => {
    initializeApp();
  });

  return {
    isInitialized,
    initError,
    initializeApp,
  };
}
