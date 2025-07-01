<!-- src/components/ui/claude/MessageInput.vue -->
<template>
  <div class="relative max-w-[var(--chat-max-width)] mr-12">
    <div class="relative">
      <!-- Input Container -->
      <div
        class="relative bg-input border-[0.5px] border-[#64635f] rounded-2xl shadow-xl transition-all flex flex-col bg-bg-000 border-0.5 border-border-300 mx-2 md:mx-0 items-stretch transition-all duration-200 relative shadow-[0_0.25rem_1.25rem_hsl(var(--always-black)/3.5%)] focus-within:shadow-[0_0.25rem_1.25rem_hsl(var(--always-black)/7.5%)] hover:border-border-200 focus-within:border-border-200 cursor-text z-10 rounded-2xl"
        :class="{ 'border-accent-primary': focused }"
      >
        <!-- Textarea -->
        <textarea
          ref="textareaRef"
          v-model="message"
          @keydown="handleKeydown"
          @focus="focused = true"
          @blur="focused = false"
          :disabled="disabled"
          placeholder="Message ommui..."
          rows="1"
          class="block w-full bg-transparent px-4 py-3.5 pr-12 text-primary placeholder-tertiary resize-none focus:outline-none disabled:opacity-50 font-sans"
          :style="{ height: textareaHeight }"
        ></textarea>

        <!-- Actions -->
        <div class="absolute right-2 bottom-2 flex items-center gap-1">
          <!-- Attachment button (future feature) -->
          <button
            type="button"
            class="p-2 text-tertiary hover:text-secondary rounded-lg hover:bg-hover transition-colors opacity-50 cursor-not-allowed"
            disabled
            title="Attachments coming soon"
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
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <!-- Send button -->
          <button
            @click="sendMessage"
            :disabled="disabled || !canSend"
            type="button"
            class="p-2 rounded-lg transition-all disabled:opacity-50"
            :class="
              canSend
                ? 'bg-accent-primary hover:bg-accent-hover text-white shadow-sm'
                : 'text-tertiary'
            "
          >
            <svg
              v-if="!isLoading"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <svg
              v-else
              class="w-4 h-4 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Helper text -->
      <div
        class="flex justify-between items-center mt-2 px-1 text-xs text-tertiary"
      >
        <span v-if="!disabled">
          {{
            message.length > 0
              ? `${message.length} characters`
              : "Shift + Enter for new line"
          }}
        </span>
        <span
          v-else-if="!configStore.hasActiveProvider"
          class="text-accent-error"
        >
          Configure AI provider in settings first
        </span>

        <span v-if="message.length > 2000" class="text-accent-error">
          Message too long ({{ message.length }}/2000)
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from "vue";
import { useConfigStore } from "@/stores/config";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["send"]);

const configStore = useConfigStore();
const message = ref("");
const focused = ref(false);
const textareaRef = ref(null);
const textareaHeight = ref("auto");

const canSend = computed(() => {
  return message.value.trim().length > 0 && message.value.length <= 2000;
});

// Auto-resize textarea
watch(message, async () => {
  await nextTick();
  if (textareaRef.value) {
    textareaRef.value.style.height = "auto";
    const scrollHeight = textareaRef.value.scrollHeight;
    const maxHeight = 200; // max height in pixels

    textareaHeight.value = `${Math.min(scrollHeight, maxHeight)}px`;
  }
});

function handleKeydown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function sendMessage() {
  if (!props.disabled && canSend.value && !props.isLoading) {
    emit("send", message.value);
    message.value = "";
    textareaHeight.value = "auto";
  }
}
</script>

<style scoped>
/* Background and borders */
.bg-input {
  background-color: var(--color-bg-input);
}
.bg-hover {
  background-color: var(--color-bg-hover);
}
.bg-accent-primary {
  background-color: var(--color-accent-primary);
}
.bg-accent-hover:hover {
  background-color: var(--color-accent-hover);
}

.border-primary {
  border-color: var(--color-border-primary);
}
.border-accent-primary {
  border-color: var(--color-accent-primary);
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
.text-white {
  color: #ffffff;
}

.placeholder-tertiary::placeholder {
  color: var(--color-text-tertiary);
  opacity: 1;
}

/* Transitions */
.transition-all {
  transition-property: all;
  transition-duration: var(--transition-default);
}

.transition-colors {
  transition-property: background-color, border-color, color;
  transition-duration: var(--transition-default);
}

/* Custom shadow */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Font */
.font-sans {
  font-family: var(--font-sans);
}
</style>
