<!-- src/components/ui/claude/MessageList.vue -->
<template>
  <div class="space-y-0">
    <!-- Welcome message if no messages -->
    <div
      v-if="messages.length === 0 && !streamingMessage"
      class="h-full flex items-center justify-center"
    >
      <WelcomeScreen
        @use-prompt="handlePrompt"
        @quick-action="handleQuickAction"
      />
    </div>

    <!-- Messages -->
    <div v-for="message in messages" :key="message.id">
      <!-- User Message -->
      <div
        v-if="message.role === 'user'"
        class="group relative inline-flex gap-2 bg-bg-300 rounded-xl pl-2.5 py-2.5 break-words text-text-100 transition-all max-w-[75ch] flex-col pr-6 bg-black mt-1 mb-1"
      >
        <div class="flex flex-row gap-2">
          <!-- User Avatar -->
          <div class="shrink-0">
            <div
              class="flex shrink-0 items-center justify-center rounded-full font-bold select-none h-7 w-7 text-[12px] bg-[#c2c0b6] text-[#262624]"
            >
              U
            </div>
          </div>

          <!-- Message Content -->
          <div class="flex-1 pt-0.5">
            <div class="prose prose-user">{{ message.content }}</div>
          </div>

          <!-- Edit button (on hover) -->
          <div
            class="absolute right-4 top-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              class="p-1.5 rounded hover:bg-tertiary transition-colors text-tertiary hover:text-secondary"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Assistant Message -->
      <div
        v-else
        class="font-claude-message relative leading-[1.65rem] [&_pre>div]:bg-bg-000/50 [&_pre>div]:border-0.5 [&_pre>div]:border-border-400 [&_.ignore-pre-bg>div]:bg-transparent [&>div>div>:is(p,blockquote,h1,h2,h3,h4,h5,h6)]:pl-2 [&>div>div>:is(p,blockquote,ul,ol,h1,h2,h3,h4,h5,h6)]:pr-8"
      >
        <div class="max-w-[var(--chat-max-width)] mx-auto flex gap-4">
          <div class="flex-1 pt-0.5">
            <div v-if="message.isError" class="text-accent-error font-medium">
              {{ message.content }}
            </div>
            <MarkdownRenderer
              v-else
              :content="message.content"
              class="prose prose-assistant"
            />

            <!-- Action buttons (on hover) -->
            <div
              v-if="!message.isError"
              class="flex items-center gap-1 mt-4 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                @click="copyMessage(message.content)"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-tertiary hover:text-secondary hover:bg-tertiary transition-all"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                {{ copied === message.id ? "Copied!" : "Copy" }}
              </button>
              <button
                @click="$emit('regenerate', message.id)"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-tertiary hover:text-secondary hover:bg-tertiary transition-all"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Regenerate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Streaming message -->
    <div
      v-if="streamingMessage"
      class="group relative py-6 bg-assistant-message"
    >
      <div class="max-w-[var(--chat-max-width)] mx-auto flex gap-4">
        <div class="flex-1 pt-0.5">
          <MarkdownRenderer
            :content="streamingMessage"
            class="prose prose-assistant"
          />
        </div>
      </div>
    </div>
    <!-- Loading indicator -->
    <div
      v-if="!streamingMessage.length && isLoading"
      class="relative py-6 bg-assistant-message"
    >
      <div class="max-w-[var(--chat-max-width)] mx-auto flex gap-4">
        <div class="flex-shrink-0 animate-bounce">
          <div
            class="w-10 h-10 rounded-full bg-assistant-avatar flex items-center justify-center"
          >
            <div class="w-6 h-6 rounded-full bg-white animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Copy, RefreshCw, Edit3, User } from "lucide-vue-next";
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import WelcomeScreen from "./WelcomeScreen.vue";

defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
  streamingMessage: {
    type: String,
    default: "",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["regenerate"]);

const copied = ref(null);

async function copyMessage(content) {
  try {
    await navigator.clipboard.writeText(content);
    copied.value = content;
    setTimeout(() => {
      copied.value = null;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

function handlePrompt(prompt) {
  // This will be handled by the parent component
  // You might want to emit this up or directly trigger a send
  console.log("Use prompt:", prompt);
}

function handleQuickAction(actionId) {
  console.log("Quick action:", actionId);
}
</script>

<style scoped>
/* Background colors */
.bg-assistant-message {
  background-color: var(--color-message-assistant-bg);
}

.bg-hover:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.bg-tertiary {
  background-color: var(--color-bg-tertiary);
}

.bg-user-avatar {
  background-color: var(--color-accent-user);
}

.bg-assistant-avatar {
  background-color: var(--color-accent-primary);
}

/* Text colors */
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

/* Typography for messages */
.prose {
  max-width: none;
  color: var(--color-text-primary);
  line-height: 1.7;
  word-wrap: break-word;
}

.prose-user {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 400;
}

.prose-assistant {
  font-family: var(--font-serif);
  font-size: 1.0625rem;
  font-weight: 400;
  letter-spacing: -0.01em;
}

/* Code blocks in messages */
.prose code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background-color: rgba(255, 255, 255, 0.08);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 400;
}

.prose pre {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.5;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-secondary);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
  font-size: inherit;
}

/* Smooth transitions */
.transition-default {
  transition-property: all;
  transition-duration: var(--transition-default);
}

.transition-opacity {
  transition-property: opacity;
  transition-duration: var(--transition-default);
}

.transition-all {
  transition-property: all;
  transition-duration: var(--transition-default);
}

.transition-colors {
  transition-property: background-color, border-color, color;
  transition-duration: var(--transition-default);
}
</style>
