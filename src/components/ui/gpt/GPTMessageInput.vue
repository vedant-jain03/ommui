<!-- src/components/ui/gpt/GPTMessageInput.vue -->
<template>
  <div
    class="flex w-[50rem] min-h-[8rem] flex-1 text-base gap-4 md:gap-5 lg:gap-6 mr-10"
  >
    <div
      class="bg-token-bg-primary flex w-full cursor-textoverflow-clip bg-clip-padding contain-inline-size dark:bg-[#303030] shadow-short rounded-[28px]"
    >
      <!-- Textarea -->
      <textarea
        ref="textareaRef"
        v-model="message"
        @keydown="handleKeydown"
        @focus="focused = true"
        @blur="focused = false"
        :disabled="disabled"
        placeholder="Ask anything"
        rows="1"
        class="flex-1 bg-transparent px-5 py-5 pr-12 text-primary resize-none focus:outline-none disabled:opacity-50"
        :style="{ height: textareaHeight }"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from "vue";

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

const message = ref("");
const focused = ref(false);
const textareaRef = ref(null);
const textareaHeight = ref("auto");

const canSend = computed(() => {
  return message.value.trim().length > 0;
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
.bg-input {
  background-color: var(--color-bg-input);
}
.bg-tertiary {
  background-color: var(--color-bg-tertiary);
}
.text-primary {
  color: var(--color-text-primary);
}
.text-tertiary {
  color: var(--color-text-tertiary);
}
.border-primary {
  border-color: var(--color-border-primary);
}

.shadow-sm {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.transition-all {
  transition-property: all;
  transition-duration: var(--transition-default);
}
</style>
