<!-- src/components/ui/claude/ClaudeLayout.vue -->
<template>
  <div class="flex h-screen bg-primary text-primary">
    <!-- Sidebar -->
    <div
      class="flex flex-col border-r border-primary transition-all duration-300"
      :class="
        sidebarCollapsed ? 'w-[3rem] overflow-hidden' : 'w-[18rem] bg-[#1f1e1d]'
      "
    >
      <div class="flex px-2 pt-2 pb-3">
        <button
          @click="toggleSidebar"
          class="p-2 rounded-md hover:bg-tertiary transition-default text-secondary"
        >
          <PanelLeftClose v-if="!sidebarCollapsed" class="w-5 h-5" />
          <PanelLeft v-else class="w-5 h-5" />
        </button>
        <div
          v-if="!sidebarCollapsed"
          class="flex items-center gap-2 transition-all delay-300"
        >
          <h1 class="text-lg font-semibold font-serif">Ommui</h1>
          <img src="../../../assets/ommui.svg" class="w-5 h-5" />
        </div>
      </div>

      <!-- New Chat Button -->
      <div class="p-2">
        <button
          @click="chatStore.createConversation"
          class="whitespace-nowrap text-sm group transition ease-in-out active:!scale-100 hover:bg-transparent flex !justify-start !min-w-0 w-full hover:bg-[#2d231f] flex items-center gap-2 p-1.5 rounded-lg"
        >
          <div
            class="p-1.5 group-active:!scale-[0.98] group-active:!shadow-none group-active:bg-accent-main-200 group-hover:-rotate-2 group-hover:scale-105 group-active:rotate-3 rounded-full transition-all ease-in-out bg-accent-primary bg-accent-primary group-hover:shadow-md"
          >
            <Plus class="w-3 h-3" />
          </div>
          <span class="text-sm font-medium text-accent-primary">New chat</span>
        </button>
      </div>

      <!-- Conversations List -->
      <div v-if="!sidebarCollapsed" class="flex-1 overflow-y-auto">
        <span class="px-4 text-xs text-tertiary">Recents</span>
        <div class="p-2 space-y-1">
          <ConversationItem
            v-for="conversation in chatStore.conversations"
            :key="conversation.id"
            :conversation="conversation"
            :active="conversation.id === chatStore.currentConversationId"
            @click="chatStore.setCurrentConversation(conversation.id)"
            @delete="chatStore.deleteConversation(conversation.id)"
          />
        </div>
      </div>

      <!-- Settings Button -->
      <div v-if="!sidebarCollapsed" class="p-3 border-t border-secondary">
        <button
          @click="showSettings = true"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-tertiary transition-default text-secondary"
        >
          <Settings class="w-4 h-4" />
          <span class="text-sm">Settings</span>
        </button>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <div
        class="h-[50px] border-b border-secondary flex items-center justify-between px-8"
      >
        <div>
          <span class="text-sm text-secondary">
            {{ theme.name }} UI •
            {{
              configStore.activeProvider
                ? providers[configStore.activeProvider]?.name
                : "No provider"
            }}
          </span>
        </div>
        <!-- UI Switcher -->
        <div class="flex items-center gap-2">
          <UIThemeSelector />
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto" ref="messageContainer">
        <div class="max-w-[var(--chat-max-width)] mx-auto py-8 px-4">
          <MessageList
            :messages="chatStore.messages"
            :streaming-message="streamingMessage"
            :is-loading="isLoading"
            @regenerate="regenerateLastResponse"
          />
        </div>
      </div>

      <!-- Input Area -->
      <div
        v-if="chatStore.messages.length"
        class="border-t border-secondary p-4 bg-primary"
      >
        <div class="max-w-[var(--chat-max-width)] mx-auto">
          <MessageInput
            :disabled="!configStore.hasActiveProvider || isLoading"
            :is-loading="isLoading"
            @send="sendMessage"
          />
          <p
            v-if="!configStore.hasActiveProvider"
            class="text-center text-sm text-accent-error mt-2"
          >
            Please configure an AI provider in settings
          </p>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <SettingsModal v-if="showSettings" @close="showSettings = false" />

    <!-- Debug Panel -->
    <DebugPanel />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted, onUpdated } from "vue";
import { useConfigStore } from "@/stores/config";
import { useChatStore } from "@/stores/chat";
import { useChat } from "@/composables/useChat";
import { useTheme } from "@/composables/useTheme";
import { useSidebar } from "@/composables/useSidebar";
import { Plus, Settings, PanelLeft, PanelLeftClose } from "lucide-vue-next";
import ConversationItem from "./ConversationItem.vue";
import MessageList from "./MessageList.vue";
import MessageInput from "./MessageInput.vue";
import SettingsModal from "./SettingsModal.vue";
import DebugPanel from "@/components/DebugPanel.vue";
import UIThemeSelector from "@/components/UIThemeSelector.vue";

const configStore = useConfigStore();
const chatStore = useChatStore();
const { isLoading, streamingMessage, sendMessage, regenerateLastResponse } =
  useChat();
const { theme } = useTheme();
const { sidebarCollapsed, toggleSidebar } = useSidebar();
const messages = computed(() => chatStore.messages);

const showSettings = ref(false);
const messageContainer = ref(null);

// Provider display names
const providers = {
  openai: { name: "GPT-4" },
  gemini: { name: "Gemini" },
  anthropic: { name: "Claude" },
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      const element = messageContainer.value;
      console.log(element);
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth", // or 'auto' for instant scroll
      });
    }
  });
};

// Watch for message changes
watch(
  () => chatStore.messages.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      scrollToBottom();
      console.log("sda");
    }
  },
  {
    immediate: true,
  }
);

// Watch for streaming message changes
watch(
  () => streamingMessage,
  (newValue) => {
    if (newValue) {
      // Use auto for streaming to avoid jarring scrolls
      scrollToBottom("auto");
    }
  }
);

// Watch for loading state changes
watch(
  () => isLoading,
  (isLoading) => {
    if (isLoading) {
      scrollToBottom();
    }
  }
);

// Scroll on mount
onMounted(() => {
  scrollToBottom();
});

// Scroll on update (catches any DOM changes)
onUpdated(() => {
  scrollToBottom();
});
</script>

<style scoped>
/* Use theme colors via utility classes */
.bg-primary {
  background-color: var(--color-bg-primary);
}
.bg-secondary {
  background-color: var(--color-bg-secondary);
}
.bg-tertiary {
  background-color: var(--color-bg-tertiary);
}
.bg-input {
  background-color: var(--color-bg-input);
}
.bg-hover {
  background-color: var(--color-bg-hover);
}

.text-primary {
  color: var(--color-text-primary);
}
.text-secondary {
  color: var(--color-text-secondary);
}
.text-tertiary {
  color: var(--color-text-tertiary);
}

.border-primary {
  border-color: var(--color-border-primary);
}
.border-secondary {
  border-color: var(--color-border-secondary);
}

/* .text-accent-primary {
  color: var(--color-accent-primary);
} */
.text-accent-error {
  color: var(--color-accent-error);
}
.border-accent-primary {
  border-color: var(--color-accent-primary);
}

.transition-default {
  transition-property: all;
  transition-duration: var(--transition-default);
}
.bg-accent-primary {
  background-color: var(--color-accent-primary);
}
.text-accent-primary {
  color: var(--color-accent-secondary);
  font-weight: 600;
}
</style>
