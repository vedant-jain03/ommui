<!-- src/components/ui/claude/SettingsModal.vue -->
<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div
      class="bg-[#2D2D30] rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-700"
      >
        <h2 class="text-xl font-semibold">Settings</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Provider Configuration -->
        <div class="mb-8">
          <h3 class="text-lg font-medium mb-4">AI Provider Configuration</h3>

          <!-- Provider Selection -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2"
              >Select Provider</label
            >
            <select
              v-model="selectedProvider"
              class="w-full bg-[#40414F] border border-gray-600 rounded-md px-3 py-2"
            >
              <option value="">Select a provider...</option>
              <option value="openai">OpenAI (GPT)</option>
              <option value="gemini">
                Google Gemini (Free tier available!)
              </option>
              <option value="anthropic" disabled>
                Anthropic (Claude) - Coming Soon
              </option>
            </select>
          </div>

          <!-- OpenAI Configuration -->
          <div v-if="selectedProvider === 'openai'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">API Key</label>
              <input
                v-model="openaiConfig.key"
                type="password"
                placeholder="sk-..."
                class="w-full bg-[#40414F] border border-gray-600 rounded-md px-3 py-2"
              />
              <p class="text-xs text-gray-400 mt-1">
                Your API key is encrypted before storage
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Model</label>
              <select
                v-model="openaiConfig.model"
                class="w-full bg-[#40414F] border border-gray-600 rounded-md px-3 py-2"
              >
                <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            <div class="flex gap-2">
              <button
                @click="testConnection"
                :disabled="!openaiConfig.key || testingConnection"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md disabled:opacity-50"
              >
                {{ testingConnection ? "Testing..." : "Test Connection" }}
              </button>
              <button
                @click="saveProvider"
                :disabled="!openaiConfig.key"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                Save Configuration
              </button>
            </div>

            <div
              v-if="testResult"
              class="p-3 rounded-md"
              :class="
                testResult.success
                  ? 'bg-green-900 text-green-200'
                  : 'bg-red-900 text-red-200'
              "
            >
              {{ testResult.message }}
            </div>
          </div>

          <!-- Gemini Configuration -->
          <div v-if="selectedProvider === 'gemini'" class="space-y-4">
            <div
              class="bg-green-900/20 border border-green-600/30 rounded-md p-3 text-sm"
            >
              <p class="text-green-200 font-medium mb-1">
                ✨ Free Tier Available!
              </p>
              <p class="text-green-300 text-xs">
                60 requests/minute, no credit card required
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">API Key</label>
              <input
                v-model="geminiConfig.key"
                type="password"
                placeholder="AIza..."
                class="w-full bg-[#40414F] border border-gray-600 rounded-md px-3 py-2"
              />
              <p class="text-xs text-gray-400 mt-1">
                Get your free API key at:
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  class="text-blue-400 hover:underline"
                >
                  makersuite.google.com
                </a>
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Model</label>
              <select
                v-model="geminiConfig.model"
                class="w-full bg-[#40414F] border border-gray-600 rounded-md px-3 py-2"
              >
                <option value="gemini-2.0-flash">
                  Gemini 2.0 Flash (Latest, Free)
                </option>
                <option value="gemini-1.5-flash">
                  Gemini 1.5 Flash (Free, Fast)
                </option>
                <option value="gemini-1.5-pro">
                  Gemini 1.5 Pro (Free, Advanced)
                </option>
              </select>
              <p class="text-xs text-gray-400 mt-1">
                2.0 Flash is the newest and most capable
              </p>
            </div>

            <div class="flex gap-2">
              <button
                @click="testConnection"
                :disabled="!geminiConfig.key || testingConnection"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md disabled:opacity-50"
              >
                {{ testingConnection ? "Testing..." : "Test Connection" }}
              </button>
              <button
                @click="saveProvider"
                :disabled="!geminiConfig.key"
                class="px-4 py-2 bg-accent-primary hover:bg-accent-hover rounded-md disabled:opacity-50 text-white"
              >
                Save Configuration
              </button>
            </div>

            <div
              v-if="testResult"
              class="p-3 rounded-md"
              :class="
                testResult.success
                  ? 'bg-green-900 text-green-200'
                  : 'bg-red-900 text-red-200'
              "
            >
              {{ testResult.message }}
            </div>
          </div>

          <!-- Saved Providers -->
          <div
            v-if="Object.keys(configStore.providers).length > 0"
            class="mt-6"
          >
            <h4 class="text-sm font-medium mb-2">Saved Providers</h4>
            <div class="space-y-2">
              <div
                v-for="(config, name) in configStore.providers"
                :key="name"
                class="flex items-center justify-between p-3 bg-[#40414F] rounded-md"
              >
                <div>
                  <span class="font-medium">{{ name }}</span>
                  <span class="text-sm text-gray-400 ml-2">{{
                    config.model
                  }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="configStore.setActiveProvider(name)"
                    class="px-3 py-1 text-sm rounded"
                    :class="
                      configStore.activeProvider === name
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 hover:bg-gray-700'
                    "
                  >
                    {{ configStore.activeProvider === name ? "Active" : "Use" }}
                  </button>
                  <button
                    @click="configStore.removeProvider(name)"
                    class="p-1 text-red-400 hover:text-red-300"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
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
import { ref, reactive } from "vue";
import { useConfigStore } from "@/stores/config";
import { useChat } from "@/composables/useChat";

const emit = defineEmits(["close"]);
const configStore = useConfigStore();
const { testConnection: testConnectionAPI } = useChat();

const selectedProvider = ref("");
const openaiConfig = reactive({
  key: "",
  model: "gpt-4-turbo-preview",
});
const geminiConfig = reactive({
  key: "",
  model: "gemini-2.0-flash",
});

const testingConnection = ref(false);
const testResult = ref(null);

async function testConnection() {
  testingConnection.value = true;
  testResult.value = null;

  try {
    // Get the right config based on provider
    const config =
      selectedProvider.value === "openai" ? openaiConfig : geminiConfig;

    // Temporarily save the provider for testing
    await configStore.setProvider(selectedProvider.value, config);
    configStore.setActiveProvider(selectedProvider.value);

    const result = await testConnectionAPI();
    testResult.value = result;
  } catch (error) {
    testResult.value = {
      success: false,
      message: error.message,
    };
  } finally {
    testingConnection.value = false;
  }
}

async function saveProvider() {
  try {
    // Get the right config based on provider
    const config =
      selectedProvider.value === "openai" ? openaiConfig : geminiConfig;

    await configStore.setProvider(selectedProvider.value, config);
    configStore.setActiveProvider(selectedProvider.value);

    // Clear form
    if (selectedProvider.value === "openai") {
      openaiConfig.key = "";
    } else {
      geminiConfig.key = "";
    }
    selectedProvider.value = "";

    testResult.value = {
      success: true,
      message: "Configuration saved successfully!",
    };
  } catch (error) {
    testResult.value = {
      success: false,
      message: `Error saving configuration: ${error.message}`,
    };
  }
}
</script>

<style scoped>
.bg-accent-primary {
  background-color: var(--color-accent-primary);
}
.bg-accent-hover:hover {
  background-color: var(--color-accent-hover);
}
.text-white {
  color: #ffffff;
}
</style>
