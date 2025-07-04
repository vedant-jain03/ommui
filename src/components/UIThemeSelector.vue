<!-- src/components/UIThemeSelector.vue -->
<template>
  <a
    href="https://www.producthunt.com/products/ommui?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-ommui"
    target="_blank"
    ><img
      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=987759&theme=dark&t=1751612855399"
      alt="ommui - Use&#0032;Claude&#0039;s&#0032;beautiful&#0032;interface&#0032;with&#0032;ChatGPT&#0039;s&#0032;brain | Product Hunt"
      style="width: 150px; height: 54px"
      width="250"
      height="54"
  /></a>
  <div class="relative">
    <Popover>
      <PopoverButton
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary hover:bg-tertiary transition-default"
      >
        <Palette class="w-4 h-4 text-secondary" />
        <span class="text-sm font-medium">{{ currentTheme.name }}</span>
        <ChevronDown class="w-3 h-3 text-tertiary" />
      </PopoverButton>

      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-1 opacity-0"
      >
        <PopoverPanel
          class="absolute right-0 mt-2 w-48 rounded-lg bg-secondary border border-primary shadow-lg overflow-hidden z-50"
        >
          <div class="p-1 flex flex-col gap-y-1">
            <button
              v-for="(theme, key) in themes"
              :key="key"
              @click="selectTheme(key)"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-tertiary transition-default group"
              :class="{ 'bg-tertiary': configStore.currentUI === key }"
            >
              <div class="flex items-center gap-3 flex-1">
                <div
                  class="w-8 h-8 rounded-md overflow-hidden border border-primary"
                >
                  <div class="h-full flex">
                    <div
                      class="w-1/2"
                      :style="{ backgroundColor: theme.preview.bg }"
                    ></div>
                    <div
                      class="w-1/2"
                      :style="{ backgroundColor: theme.preview.accent }"
                    ></div>
                  </div>
                </div>
                <span class="text-sm font-medium">{{ theme.name }}</span>
              </div>
              <Check
                v-if="configStore.currentUI === key"
                class="w-4 h-4 text-accent-primary"
              />
            </button>
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useConfigStore } from "@/stores/config";
import {
  Palette,
  ChevronDown,
  Check,
  Sparkles, // For Claude
  Bot, // For GPT
  Brain, // For other AI
} from "lucide-vue-next";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";

const configStore = useConfigStore();

const themes = computed(() => ({
  "claude-style": {
    name: "Claude",
    icon: Sparkles,
    preview: {
      bg: "#262624",
      accent: "#c76341",
    },
  },
  "gpt-style": {
    name: "ChatGPT",
    icon: Bot,
    preview: {
      bg: "#ffffff",
      accent: "#10a37f",
    },
  },
}));

const currentTheme = computed(() => themes.value[configStore.currentUI]);

function selectTheme(themeKey) {
  configStore.setUI(themeKey);
}
</script>

<script>
// Simple Tooltip component
const Tooltip = {
  props: ["content"],
  template: `
    <div class="relative group">
      <slot />
      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-secondary text-primary text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {{ content }}
      </div>
    </div>
  `,
};

export default {
  components: { Tooltip },
};
</script>

<style scoped>
.bg-primary {
  background-color: var(--color-bg-primary);
}
.bg-secondary {
  background-color: var(--color-bg-secondary);
}
.bg-tertiary {
  background-color: var(--color-bg-tertiary);
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
.text-accent-primary {
  color: var(--color-accent-primary);
}

.border-primary {
  border-color: var(--color-border-primary);
}

.hover\:bg-tertiary:hover {
  background-color: var(--color-bg-tertiary);
}
.hover\:text-primary:hover {
  color: var(--color-text-primary);
}

.transition-default {
  transition-property: all;
  transition-duration: var(--transition-default);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
</style>
