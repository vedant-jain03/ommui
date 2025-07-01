<!-- src/components/ui/gpt/GPTConversationItem.vue -->
<template>
  <div
    @click="$emit('click')"
    class="group relative flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm"
    :class="active ? 'bg-tertiary' : 'bg-hover'"
  >
    <span class="flex-1 truncate text-primary">{{ conversation.title }}</span>

    <!-- Actions -->
    <div
      v-if="active"
      class="flex items-center gap-1 opacity-0 group-hover:opacity-100"
    >
      <button
        @click.stop="$emit('delete')"
        class="p-1 rounded hover:bg-hover text-tertiary hover:text-primary transition-all"
      >
        <Trash2 class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>

<script setup>
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

defineEmits(["click", "delete"]);
</script>

<style scoped>
.bg-tertiary {
  background-color: var(--color-bg-tertiary);
}
.bg-hover:hover {
  background-color: var(--color-bg-hover);
}
.text-primary {
  color: var(--color-text-primary);
}
.text-tertiary {
  color: var(--color-text-tertiary);
}

.transition-all {
  transition-property: all;
  transition-duration: var(--transition-default);
}
</style>
