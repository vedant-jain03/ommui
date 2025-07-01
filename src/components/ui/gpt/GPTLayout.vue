<!-- src/components/ui/gpt/GPTLayout.vue -->
<template>
  <div class="flex h-screen bg-primary text-primary">
    <!-- Sidebar -->
    <div
      class="flex flex-col transition-all duration-300 p-2 pt-4"
      :class="
        sidebarCollapsed
          ? 'w-[3.5rem] overflow-hidden border-r border-black'
          : 'w-[260px] bg-secondary'
      "
    >
      <div class="flex px-3 pb-4 justify-between">
        <div
          v-if="!sidebarCollapsed"
          class="flex items-center gap-4 transition-all delay-300"
        >
          <h1 class="text-lg font-semibold">Ommui</h1>
          <img src="../../../assets/ommui.svg" class="w-5 h-5" />
        </div>
        <button
          @click="toggleSidebar"
          class="rounded-md hover:bg-tertiary transition-default text-secondary"
        >
          <PanelLeftClose v-if="!sidebarCollapsed" class="w-5 h-5" />
          <PanelLeft v-else class="w-5 h-5" />
        </button>
      </div>
      <!-- New Chat Button -->

      <div>
        <button
          @click="chatStore.createConversation"
          class="w-full flex items-center new-chat gap-2 px-3 py-2 rounded-xl hover:bg-tertiary transition-all text-sm transition-all delay-300"
        >
          <div>
            <SquarePen class="w-4 h-4" />
          </div>
          <span v-if="!sidebarCollapsed">New chat</span>
        </button>
      </div>

      <!-- Conversations List -->
      <div v-if="!sidebarCollapsed" class="flex-1 overflow-y-auto">
        <h4 class="px-3 text-tertiary my-1 text-xs pt-3">Chats</h4>
        <div class="space-y-1">
          <GPTConversationItem
            v-for="conversation in chatStore.conversations"
            :key="conversation.id"
            :conversation="conversation"
            :active="conversation.id === chatStore.currentConversationId"
            @click="chatStore.setCurrentConversation(conversation.id)"
            @delete="chatStore.deleteConversation(conversation.id)"
          />
        </div>
      </div>

      <!-- User Menu -->
      <div v-if="!sidebarCollapsed" class="border-t border-primary">
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
    <div class="flex-1 flex flex-col bg-primary">
      <div
        class="h-[60px] border-b border-primary flex items-center justify-between px-6"
      >
        <div class="flex items-center gap-4 text-white">
          <span class="text-sm text-white">
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
      <div class="flex-1 overflow-y-auto">
        <GPTMessageList
          :messages="chatStore.messages"
          :streaming-message="streamingMessage"
          :is-loading="isLoading"
          @regenerate="regenerateLastResponse"
        />
      </div>

      <!-- Input Area -->
      <div
        v-if="chatStore.messages?.length !== 0"
        class="isolate z-3 w-full flex"
      >
        <div class="text-base mx-auto">
          <GPTMessageInput
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
          <p class="text-center text-xs text-tertiary mt-3">
            {{
              configStore.activeProvider
                ? providers[configStore.activeProvider]?.name
                : "No model"
            }}
            <span class="mx-1">·</span>
            ommui can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <SettingsModal v-if="showSettings" @close="showSettings = false" />

    <DebugPanel />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useConfigStore } from "@/stores/config";
import { useChatStore } from "@/stores/chat";
import { useChat } from "@/composables/useChat";
import { useTheme } from "@/composables/useTheme";
import { useSidebar } from "@/composables/useSidebar";
import UIThemeSelector from "@/components/UIThemeSelector.vue";
import GPTConversationItem from "./GPTConversationItem.vue";
import GPTMessageList from "./GPTMessageList.vue";
import GPTMessageInput from "./GPTMessageInput.vue";
import SettingsModal from "../claude/SettingsModal.vue";
import DebugPanel from "@/components/DebugPanel.vue";
import {
  Plus,
  Settings,
  PanelLeft,
  PanelLeftClose,
  SquarePen,
} from "lucide-vue-next";

const configStore = useConfigStore();
const chatStore = useChatStore();
const { isLoading, streamingMessage, sendMessage, regenerateLastResponse } =
  useChat();
const { theme } = useTheme();
const { sidebarCollapsed, toggleSidebar } = useSidebar();

const showSettings = ref(false);

// Provider display names
const providers = {
  openai: { name: "GPT-4" },
  gemini: { name: "Gemini" },
  anthropic: { name: "Claude" },
};
</script>

<style scoped>
/* ChatGPT uses the same color system but different application */
.bg-primary {
  background-color: var(--color-bg-primary);
}
.bg-secondary {
  background-color: var(--color-bg-secondary);
}
.bg-hover:hover {
  background-color: var(--color-bg-hover);
}
.bg-accent-primary {
  background-color: var(--color-accent-primary);
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
.text-accent-error {
  color: var(--color-accent-error);
}
.text-white {
  color: #ffffff;
}

.border-primary {
  border-color: var(--color-border-primary);
}

.new-chat:hover {
  background-color: var(--color-bg-tertiary);
}
</style>
