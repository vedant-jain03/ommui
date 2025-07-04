<!-- src/components/OnboardingFlow.vue -->
<template>
  <div class="onboarding-container">
    <div class="onboarding-content">
      <!-- Logo/Title -->
      <div class="onboarding-header">
        <div class="logo">
          <Sparkles class="w-12 h-12 text-accent-primary" />
        </div>

        <h1 class="title">Welcome to ommui</h1>
        <p class="subtitle">One Model, Multiple UIs - Your AI, Your Way</p>
      </div>

      <!-- Steps -->
      <div class="steps-container">
        <!-- Step 1: Choose Provider -->
        <div v-if="currentStep === 1" class="step">
          <h2 class="step-title">Choose Your AI Provider</h2>
          <p class="step-description">
            Select your preferred AI model to get started
          </p>

          <div class="provider-options">
            <button
              v-for="(provider, key) in providers"
              :key="key"
              @click="selectProvider(key)"
              class="provider-card"
              :class="{ selected: selectedProvider === key }"
            >
              <component :is="provider.icon" class="provider-icon" />
              <h3 class="provider-name">{{ provider.name }}</h3>
              <p class="provider-description">{{ provider.description }}</p>
              <div v-if="provider.badge" class="provider-badge">
                {{ provider.badge }}
              </div>
            </button>
          </div>

          <button
            @click="nextStep"
            :disabled="!selectedProvider"
            class="continue-button"
          >
            Continue
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Step 2: Add API Key -->
        <div v-if="currentStep === 2" class="step">
          <button @click="currentStep = 1" class="back-button">
            <ArrowLeft class="w-4 h-4" />
            Back
          </button>

          <h2 class="step-title">Add Your API Key</h2>
          <p class="step-description">
            {{ providers[selectedProvider].keyInstructions }}
          </p>

          <div class="key-input-container">
            <input
              v-model="apiKey"
              :type="showKey ? 'text' : 'password'"
              :placeholder="providers[selectedProvider].keyPlaceholder"
              class="key-input"
              @keyup.enter="testAndSave"
            />
            <button @click="showKey = !showKey" class="toggle-visibility">
              <Eye v-if="!showKey" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>

          <a
            :href="providers[selectedProvider].keyUrl"
            target="_blank"
            class="help-link"
          >
            <ExternalLink class="w-4 h-4" />
            Get your API key
          </a>

          <button
            @click="testAndSave"
            :disabled="!apiKey || testing"
            class="continue-button"
          >
            <Loader2 v-if="testing" class="w-4 h-4 animate-spin" />
            <span v-else>Test & Continue</span>
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </div>

        <!-- Step 3: Choose UI Theme -->
        <div v-if="currentStep === 3" class="step">
          <h2 class="step-title">Choose Your Interface</h2>
          <p class="step-description">Select your preferred UI style</p>

          <div class="theme-options">
            <button
              v-for="(theme, key) in themes"
              :key="key"
              @click="selectTheme(key)"
              class="theme-card"
              :class="{ selected: selectedTheme === key }"
            >
              <div class="theme-preview">
                <div
                  class="theme-preview-header"
                  :style="{ backgroundColor: theme.colors.header }"
                ></div>
                <div
                  class="theme-preview-body"
                  :style="{ backgroundColor: theme.colors.bg }"
                >
                  <div
                    class="theme-preview-sidebar"
                    :style="{ backgroundColor: theme.colors.sidebar }"
                  ></div>
                  <div class="theme-preview-content">
                    <div
                      class="theme-preview-message"
                      :style="{ backgroundColor: theme.colors.message }"
                    ></div>
                  </div>
                </div>
              </div>
              <h3 class="theme-name">{{ theme.name }}</h3>
            </button>
          </div>

          <button @click="finishOnboarding" class="continue-button">
            Start Chatting
            <Rocket class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Progress dots -->
      <div class="progress-dots">
        <div
          v-for="step in 3"
          :key="step"
          class="dot"
          :class="{
            active: step === currentStep,
            completed: step < currentStep,
          }"
        ></div>
      </div>
    </div>
    <div class="absolute right-2 top-2">
      <a
        href="https://www.producthunt.com/products/ommui?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-ommui"
        target="_blank"
        ><img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=987759&theme=dark&t=1751612855399"
          alt="ommui - Use&#0032;Claude&#0039;s&#0032;beautiful&#0032;interface&#0032;with&#0032;ChatGPT&#0039;s&#0032;brain | Product Hunt"
          style="width: 250px; height: 54px"
          width="250"
          height="54"
      /></a>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useConfigStore } from "@/stores/config";
import { useChat } from "@/composables/useChat";
import {
  Sparkles,
  Bot,
  Brain,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Rocket,
} from "lucide-vue-next";
import { useRouter } from "vue-router";

const emit = defineEmits(["complete"]);

const configStore = useConfigStore();
const router = useRouter();

const currentStep = ref(1);
const selectedProvider = ref("");
const apiKey = ref("");
const showKey = ref(false);
const selectedTheme = ref("claude-style");
const testing = ref(false);
const error = ref("");

const providers = {
  gemini: {
    name: "Google Gemini",
    icon: Brain,
    description: "Free tier available, no credit card required",
    badge: "Recommended",
    keyPlaceholder: "AIza...",
    keyInstructions:
      "Gemini offers a generous free tier. Get your API key from Google AI Studio.",
    keyUrl: "https://aistudio.google.com/app/apikey",
    model: "gemini-2.0-flash",
  },
  openai: {
    name: "OpenAI GPT",
    icon: Bot,
    description: "GPT-4 and GPT-3.5 models",
    keyPlaceholder: "sk-...",
    keyInstructions: "You'll need an OpenAI account with billing enabled.",
    keyUrl: "https://platform.openai.com/api-keys",
    model: "gpt-4-turbo-preview",
  },
  anthropic: {
    name: "Anthropic Claude",
    icon: Sparkles,
    description: "Claude 3 models - Coming soon",
    disabled: true,
    keyPlaceholder: "sk-ant-...",
    keyInstructions: "Claude API support coming soon!",
    keyUrl: "https://console.anthropic.com/",
    model: "claude-3-opus",
  },
};

const themes = {
  "claude-style": {
    name: "Claude",
    colors: {
      header: "#262624",
      bg: "#262624",
      sidebar: "#1f1f1c",
      message: "#3a3a36",
    },
  },
  "gpt-style": {
    name: "ChatGPT",
    colors: {
      header: "#ffffff",
      bg: "#ffffff",
      sidebar: "#f9f9f9",
      message: "#f7f7f8",
    },
  },
};

function selectProvider(provider) {
  if (!providers[provider].disabled) {
    selectedProvider.value = provider;
  }
}

function selectTheme(theme) {
  selectedTheme.value = theme;
}

function nextStep() {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
}

async function testAndSave() {
  if (!apiKey.value) return;

  testing.value = true;
  error.value = "";

  try {
    // Save the provider configuration
    await configStore.setProvider(selectedProvider.value, {
      key: apiKey.value,
      model: providers[selectedProvider.value].model,
    });

    configStore.setActiveProvider(selectedProvider.value);

    // Test the connection
    const { testConnection } = useChat();
    const result = await testConnection();

    if (result.success) {
      nextStep();
    } else {
      error.value = result.message;
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    testing.value = false;
  }
}

async function finishOnboarding() {
  // Set the selected theme
  configStore.setUI(selectedTheme.value);

  // Mark onboarding as complete
  localStorage.setItem("ommui-onboarding-complete", "true");

  // Emit complete or navigate
  emit("complete");
}
</script>

<style scoped>
.onboarding-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--color-bg-primary);
}

.onboarding-content {
  max-width: 42rem;
  width: 100%;
}

.onboarding-header {
  text-align: center;
  margin-bottom: 3rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background-color: var(--color-bg-tertiary);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
  font-family: var(--font-serif);
}

.subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
}

.step {
  position: relative;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.step-description {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.provider-options,
.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.provider-card,
.theme-card {
  position: relative;
  padding: 1.5rem;
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-border-primary);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.provider-card:hover:not([disabled]),
.theme-card:hover {
  border-color: var(--color-accent-primary);
  transform: translateY(-2px);
}

.provider-card.selected,
.theme-card.selected {
  border-color: var(--color-accent-primary);
  background-color: var(--color-bg-tertiary);
}

.provider-card[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.provider-icon {
  width: 2rem;
  height: 2rem;
  color: var(--color-accent-primary);
  margin-bottom: 1rem;
}

.provider-name,
.theme-name {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.provider-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.provider-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: var(--color-accent-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

.key-input-container {
  position: relative;
  margin-bottom: 1rem;
}

.key-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: 0.5rem;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

.key-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.toggle-visibility {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem;
  color: var(--color-text-tertiary);
  transition: color 0.2s;
}

.toggle-visibility:hover {
  color: var(--color-text-primary);
}

.help-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-accent-primary);
  font-size: 0.875rem;
  margin-bottom: 2rem;
  transition: opacity 0.2s;
}

.help-link:hover {
  opacity: 0.8;
}

.continue-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-accent-primary);
  color: white;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.continue-button:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
  transform: translateY(-1px);
}

.continue-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}

.back-button:hover {
  color: var(--color-text-primary);
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: var(--color-accent-error);
  font-size: 0.875rem;
}

.theme-preview {
  width: 100%;
  height: 120px;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 1px solid var(--color-border-primary);
}

.theme-preview-header {
  height: 20px;
}

.theme-preview-body {
  height: 100px;
  display: flex;
}

.theme-preview-sidebar {
  width: 60px;
}

.theme-preview-content {
  flex: 1;
  padding: 10px;
}

.theme-preview-message {
  height: 20px;
  border-radius: 4px;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 3rem;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: var(--color-border-primary);
  transition: all 0.2s;
}

.dot.active {
  background-color: var(--color-accent-primary);
  transform: scale(1.2);
}

.dot.completed {
  background-color: var(--color-accent-primary);
  opacity: 0.5;
}
</style>
