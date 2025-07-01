<!-- src/components/ui/gpt/GPTMessageList.vue -->
<template>
  <div class="flex flex-col h-full">
    <!-- Messages Container with fixed height and scroll -->
    <div class="flex-1 overflow-y-auto" ref="messageContainer">
      <!-- Welcome message if no messages -->
      <div
        v-if="messages.length === 0 && !streamingMessage"
        class="h-[40rem] flex items-center justify-center"
      >
        <div class="text-center max-w-2xl px-4">
          <div class="flex items-center justify-center gap-2 mb-8">
            <h1 class="text-3xl text-primary">What can I help with?</h1>
            <div class="provider-badge" v-if="currentProvider">
              <component :is="providerIcon" class="w-4 h-4" />
              <span>{{ currentProvider.name }}</span>
            </div>
          </div>

          <div class="max-w-[40rem]">
            <GPTMessageInput
              :disabled="!configStore.hasActiveProvider || isLoading"
              :is-loading="isLoading"
              class="max-w-[40rem]"
              @send="sendMessage"
            />
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="pb-32">
        <div v-for="message in messages" :key="message.id">
          <!-- User Message -->
          <div
            v-if="message.role === 'user'"
            class="text-base my-auto mx-auto py-5 px-[calc(0.25rem*6)] max-w-[45rem]"
          >
            <div
              class="min-h-8 text-message relative flex w-full flex-col items-end gap-2 text-start break-words whitespace-normal [.text-message+&]:mt-5"
            >
              <div
                class="relative max-w-[var(--user-chat-width,70%)] bg-[#323232d9] rounded-3xl px-5 py-2.5"
              >
                <div class="flex-1 text-primary">{{ message.content }}</div>
              </div>
            </div>
          </div>

          <!-- Assistant Message -->
          <div v-else class="text-base my-auto mx-auto py-5 max-w-[50rem]">
            <div
              class="min-h-8 text-message relative flex w-full flex-col items-start gap-2 text-start break-words whitespace-normal [.text-message+&]:mt-5"
            >
              <div class="relative px-5 py-2.5">
                <div class="flex-1">
                  <div v-if="message.isError" class="text-accent-error">
                    {{ message.content }}
                  </div>
                  <MarkdownRenderer
                    v-else
                    :content="message.content"
                    class="text-primary w-[45rem]"
                  />

                  <!-- Actions -->
                  <div
                    v-if="!message.isError"
                    class="flex items-center gap-4 mt-4"
                  >
                    <button
                      @click="copyMessage(message.content)"
                      class="text-tertiary hover:text-primary transition-colors"
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
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <button
                      @click="$emit('regenerate', message.id)"
                      class="text-tertiary hover:text-primary transition-colors"
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  </div>
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

        <!-- Loading -->
        <div
          v-if="isLoading && !streamingMessage"
          class="text-base my-auto mx-auto py-5 max-w-[50rem]"
        >
          <div class="max-w-3xl mx-auto py-6">
            <div class="flex gap-4">
              <div class="flex-1">
                <div class="flex gap-1">
                  <div
                    class="w-4 h-4 bg-white rounded-full animate-bounce"
                    style="animation-delay: 0ms"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUpdated } from "vue";
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import GPTMessageInput from "./GPTMessageInput.vue";
import { useChat } from "@/composables/useChat";
import { useConfigStore } from "@/stores/config";
import { Sparkles, Bot, Brain, ConstructionIcon } from "lucide-vue-next";

const props = defineProps({
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
const configStore = useConfigStore();
const { sendMessage } = useChat();
const messageContainer = ref(null);

const currentProvider = computed(() => {
  if (!configStore.activeProvider) return null;

  const providers = {
    openai: { name: "GPT-4", icon: Bot },
    gemini: { name: "Gemini", icon: Brain },
    anthropic: { name: "Claude", icon: Sparkles },
  };

  return providers[configStore.activeProvider];
});
const providerIcon = computed(() => currentProvider.value?.icon || Bot);

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

// Function to scroll to bottom
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      const element = messageContainer.value;

      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth", // or 'auto' for instant scroll
      });
    }
  });
};

// Watch for message changes
watch(
  () => props.messages.length,
  () => {
    scrollToBottom();
  }
);

// Watch for streaming message changes
watch(
  () => props.streamingMessage,
  () => {
    if (props.streamingMessage) {
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
.bg-assistant-bg {
  background-color: var(--color-message-assistant-bg);
}
.bg-hover:hover {
  background-color: var(--color-bg-hover);
}
.bg-tertiary {
  background-color: var(--color-bg-tertiary);
}
.bg-accent-primary {
  background-color: var(--color-accent-primary);
}
.bg-primary {
  background-color: var(--color-bg-primary);
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

.transition-all {
  transition-property: all;
  transition-duration: var(--transition-default);
}

.transition-colors {
  transition-property: background-color, border-color, color;
  transition-duration: var(--transition-default);
}

.provider-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-bg-hover);
  border-radius: 9999px;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}
</style>
