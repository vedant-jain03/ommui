// src/composables/useTheme.js
import { computed, watchEffect } from "vue";
import { useConfigStore } from "@/stores/config";
import { getTheme } from "@/config/themes";

export function useTheme() {
  const configStore = useConfigStore();

  const currentTheme = computed(() => {
    return getTheme(configStore.currentUI);
  });

  // Apply theme to CSS variables
  watchEffect(() => {
    const theme = currentTheme.value;
    const root = document.documentElement;

    // Set CSS variables for colors
    Object.entries(theme.colors).forEach(([category, values]) => {
      if (typeof values === "object") {
        Object.entries(values).forEach(([key, value]) => {
          root.style.setProperty(`--color-${category}-${key}`, value);
        });
      }
    });

    // Set font families
    root.style.setProperty("--font-sans", theme.fonts.sans);
    root.style.setProperty("--font-serif", theme.fonts.serif);
    root.style.setProperty("--font-mono", theme.fonts.mono);

    // Set other properties
    root.style.setProperty("--chat-max-width", theme.spacing.chat.maxWidth);
    root.style.setProperty("--transition-default", theme.transitions.default);
    root.style.setProperty("--transition-slow", theme.transitions.slow);
  });

  return {
    theme: currentTheme,
  };
}
