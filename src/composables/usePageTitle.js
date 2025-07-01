import { watch, computed } from "vue";
import { useConfigStore } from "@/stores/config";

export function usePageTitle() {
  const configStore = useConfigStore();

  // Provider display names
  const providerNames = {
    openai: "GPT-4",
    gemini: "Gemini",
    anthropic: "Claude",
  };

  // UI display names
  const uiNames = {
    "claude-style": "Claude",
    "gpt-style": "ChatGPT",
  };

  // Compute the title
  const pageTitle = computed(() => {
    const provider = configStore.activeProvider;
    const ui = configStore.currentUI;

    if (!provider) {
      return "Ommui - One Model, Multiple UIs";
    }

    const providerName = providerNames[provider] || provider;
    const uiName = uiNames[ui] || ui;

    // Format: "ommui - GPT-4 × Claude UI"
    return `Ommui - ${providerName} × ${uiName}`;
  });

  // Watch for changes and update document title
  watch(
    pageTitle,
    (newTitle) => {
      document.title = newTitle;
    },
    { immediate: true }
  );

  // Also update when provider or UI changes
  watch([() => configStore.activeProvider, () => configStore.currentUI], () => {
    document.title = pageTitle.value;
  });

  return {
    pageTitle,
  };
}
