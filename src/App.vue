<template>
  <div id="app" class="h-screen w-screen overflow-hidden bg-gray-50">
    <!-- Loading State -->
    <div v-if="!isInitialized" class="flex h-full items-center justify-center">
      <div class="text-center">
        <div
          class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"
        ></div>
        <p class="text-gray-600">Initializing AI UI Switcher...</p>
        <p v-if="initError" class="mt-2 text-red-600">Error: {{ initError }}</p>
      </div>
    </div>

    <!-- Onboarding Flow - Only show if not completed AND no provider configured -->
    <OnboardingFlow
      v-else-if="shouldShowOnboarding"
      @complete="completeOnboarding"
    />

    <!-- Main App -->
    <component :is="currentUIComponent" v-else />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useAppInit } from "@/composables/useAppInit";
import { useConfigStore } from "@/stores/config";
import { useChatStore } from "@/stores/chat";
import { useTheme } from "@/composables/useTheme";
import { usePageTitle } from "@/composables/usePageTitle";
import ClaudeLayout from "@/components/ui/claude/ClaudeLayout.vue";
import GPTLayout from "@/components/ui/gpt/GPTLayout.vue";
import OnboardingFlow from "@/components/OnboardingFlow.vue";

// Initialize app
const { isInitialized, initError } = useAppInit();
const isOnboardingComplete = ref(false);

// Get stores
const configStore = useConfigStore();
const chatStore = useChatStore();

// Initialize theme system
useTheme();

// Initialise page title
usePageTitle();

// Check if we should show onboarding
const shouldShowOnboarding = computed(() => {
  // Show onboarding only if:
  // 1. User has never completed onboarding OR
  // 2. No provider is configured (even if they closed onboarding before)
  const hasCompletedOnboarding =
    localStorage.getItem("ommui-onboarding-complete") === "true" ||
    isOnboardingComplete.value;
  const hasProvider = configStore.hasActiveProvider;

  return !hasCompletedOnboarding || !hasProvider;
});

// Dynamic UI component based on selected UI
const currentUIComponent = computed(() => {
  switch (configStore.currentUI) {
    case "gpt-style":
      return GPTLayout;
    case "claude-style":
    default:
      return ClaudeLayout;
  }
});

watch(
  () => configStore.currentUI,
  () => {
    if (configStore.hasActiveProvider) {
      let provider;
      switch (configStore.activeProvider) {
        case "gpt-style":
          provider = "gpt";
          break;
        case "cluade-style":
      }
    }
    // if (currentUIComponent) {
    //   document.title = currentUIComponent.value;
    // }
  }
);

function completeOnboarding() {
  isOnboardingComplete.value = true;
}
</script>

<style>
/* Reset default styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
