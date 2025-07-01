<!-- src/components/ui/claude/ConversationItem.vue -->
<template>
  <div
    @click="$emit('click')"
    class="group relative flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer transition-default conversation-item transition-all duration-300"
    :class="active ? 'bg-tertiary' : 'hover:bg-tertiary'"
  >
    <!-- Title -->
    <span class="flex-1 text-sm truncate text-tertiary">{{
      conversation.title
    }}</span>

    <!-- Delete button (shows on hover) -->
    <button
      v-if="active || showDelete"
      @click.stop="handleDelete"
      @mouseenter="showDelete = true"
      @mouseleave="showDelete = false"
      class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-hover rounded"
    >
      <Trash2 class="w-3 h-3" />
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Trash2 } from "lucide-vue-next";

defineProps({
  conversation: {
    type: Object,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click", "delete"]);
const showDelete = ref(false);

function handleDelete() {
  if (confirm("Delete this conversation?")) {
    emit("delete");
  }
}
</script>

<style scoped>
.bg-tertiary {
  background-color: var(--color-bg-tertiary);
}
.bg-hover {
  background-color: var(--color-bg-hover);
}
.text-tertiary {
  color: var(--color-text-tertiary);
}
.transition-default {
  transition-property: all;
  transition-duration: var(--transition-default);
}
.conversation-item {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 400;
}
.conversation-item:hover {
  background-color: var(--color-bg-tertiary);
}
</style>
