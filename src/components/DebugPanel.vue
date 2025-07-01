<!-- src/components/DebugPanel.vue -->
<template>
  <div
    v-if="showDebug"
    class="fixed bottom-4 right-4 w-96 max-h-[80vh] bg-secondary border border-primary rounded-lg shadow-lg overflow-hidden flex flex-col"
  >
    <!-- Header -->
    <div class="flex justify-between items-center p-4 border-b border-primary">
      <h3 class="font-bold text-primary">Debug Panel</h3>
      <button
        @click="showDebug = false"
        class="text-tertiary hover:text-primary text-2xl leading-none"
      >
        ×
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 text-sm font-mono">
      <!-- System Info -->
      <div class="space-y-2">
        <h4 class="text-primary font-semibold">System Info</h4>
        <div class="space-y-1 text-tertiary">
          <div>
            <span class="text-secondary">Version:</span> {{ appVersion }}
          </div>
          <div>
            <span class="text-secondary">Environment:</span> {{ environment }}
          </div>
          <div>
            <span class="text-secondary">Browser:</span> {{ browserInfo }}
          </div>
        </div>
      </div>

      <!-- Provider Info -->
      <div class="space-y-2">
        <h4 class="text-primary font-semibold">Provider Status</h4>
        <div class="space-y-1 text-tertiary">
          <div>
            <span class="text-secondary">Active:</span>
            <span
              :class="
                configStore.activeProvider ? 'text-green-400' : 'text-red-400'
              "
            >
              {{ configStore.activeProvider || "None" }}
            </span>
          </div>
          <div v-if="configStore.activeProvider">
            <span class="text-secondary">Model:</span>
            {{
              configStore.providers[configStore.activeProvider]?.model || "N/A"
            }}
          </div>
          <div v-if="configStore.activeProvider">
            <span class="text-secondary">API Key:</span>
            <span class="text-xs">
              {{ maskedApiKey }}
            </span>
          </div>
        </div>
      </div>

      <!-- Storage Info -->
      <div class="space-y-2">
        <h4 class="text-primary font-semibold">Storage</h4>
        <div class="space-y-1 text-tertiary">
          <div>
            <span class="text-secondary">Conversations:</span>
            {{ chatStore.conversations.length }}
          </div>
          <div>
            <span class="text-secondary">Current Chat:</span>
            {{ chatStore.messages.length }} messages
          </div>
          <div>
            <span class="text-secondary">IndexedDB:</span>
            <span
              :class="dbStatus.connected ? 'text-green-400' : 'text-red-400'"
            >
              {{ dbStatus.connected ? "Connected" : "Disconnected" }}
            </span>
          </div>
          <div>
            <span class="text-secondary">Storage Used:</span>
            {{ storageUsed }}
          </div>
        </div>
      </div>

      <!-- Performance -->
      <div class="space-y-2">
        <h4 class="text-primary font-semibold">Performance</h4>
        <div class="space-y-1 text-tertiary">
          <div>
            <span class="text-secondary">Load Time:</span>
            {{ loadTime }}ms
          </div>
          <div>
            <span class="text-secondary">Memory:</span>
            {{ memoryUsage }}
          </div>
          <div>
            <span class="text-secondary">API Latency:</span>
            {{ lastApiLatency }}ms
          </div>
        </div>
      </div>

      <!-- Errors -->
      <div v-if="errors.length > 0" class="space-y-2">
        <h4 class="text-primary font-semibold">Recent Errors</h4>
        <div class="space-y-2">
          <div
            v-for="(error, index) in errors"
            :key="index"
            class="text-xs p-2 bg-red-900/20 border border-red-800/30 rounded"
          >
            <div class="text-red-400">{{ error.timestamp }}</div>
            <div class="text-red-300">{{ error.message }}</div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-2 pt-2 border-t border-primary">
        <h4 class="text-primary font-semibold">Actions</h4>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="testConnection"
            :disabled="testing || !configStore.activeProvider"
            class="px-3 py-1.5 bg-accent-primary text-white rounded text-xs hover:bg-accent-hover disabled:opacity-50"
          >
            {{ testing ? "Testing..." : "Test API" }}
          </button>

          <button
            @click="clearCache"
            class="px-3 py-1.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
          >
            Clear Cache
          </button>

          <button
            @click="exportDebugLog"
            class="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Export Log
          </button>

          <button
            @click="copyDebugInfo"
            class="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
          >
            Copy Info
          </button>
        </div>

        <div
          v-if="actionResult"
          class="mt-2 p-2 rounded text-xs"
          :class="
            actionResult.success
              ? 'bg-green-900/20 text-green-300'
              : 'bg-red-900/20 text-red-300'
          "
        >
          {{ actionResult.message }}
        </div>
      </div>
    </div>
  </div>

  <!-- Toggle button -->
  <button
    v-if="!showDebug && isDevelopment"
    @click="showDebug = true"
    class="fixed bottom-4 right-4 bg-secondary text-tertiary hover:text-primary px-3 py-1.5 rounded-full text-xs font-mono border border-primary shadow-lg hover:shadow-xl transition-all"
  >
    🐛 Debug
  </button>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useConfigStore } from "@/stores/config";
import { useChatStore } from "@/stores/chat";

const configStore = useConfigStore();
const chatStore = useChatStore();

// State
const showDebug = ref(false);
const testing = ref(false);
const actionResult = ref(null);
const errors = ref([]);
const dbStatus = ref({ connected: false });
const storageUsed = ref("Calculating...");
const memoryUsage = ref("N/A");
const lastApiLatency = ref(0);
const loadTime = ref(0);

// Environment detection
const isDevelopment = import.meta.env.DEV;
const environment = import.meta.env.MODE;
const appVersion = "1.0.0"; // You can import this from package.json

// Browser info
const browserInfo = computed(() => {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
});

// Masked API key
const maskedApiKey = computed(() => {
  if (
    !configStore.activeProvider ||
    !configStore.providers[configStore.activeProvider]
  ) {
    return "Not set";
  }
  const key = configStore.providers[configStore.activeProvider].key;
  if (key.length > 10) {
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }
  return "Invalid";
});

// Track errors
window.addEventListener("unhandledrejection", (event) => {
  errors.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    message: event.reason?.message || event.reason || "Unknown error",
  });
  // Keep only last 5 errors
  if (errors.value.length > 5) {
    errors.value = errors.value.slice(0, 5);
  }
});

// Track API latency
window.addEventListener("api-request-complete", (event) => {
  lastApiLatency.value = event.detail.latency || 0;
});

// Check IndexedDB status
async function checkDBStatus() {
  try {
    const dbs = await indexedDB.databases();
    dbStatus.value.connected = dbs.some((db) => db.name === "ai-ui-switcher");
  } catch (e) {
    dbStatus.value.connected = false;
  }
}

// Calculate storage used
async function calculateStorage() {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const used = (estimate.usage / 1024 / 1024).toFixed(2);
      const quota = (estimate.quota / 1024 / 1024).toFixed(2);
      storageUsed.value = `${used}MB / ${quota}MB`;
    } catch (e) {
      storageUsed.value = "Unknown";
    }
  } else {
    storageUsed.value = "Not supported";
  }
}

// Check memory usage
function checkMemoryUsage() {
  if ("memory" in performance) {
    const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
    memoryUsage.value = `${used}MB / ${total}MB`;
  }
}

// Actions
async function testConnection() {
  testing.value = true;
  actionResult.value = null;

  try {
    const startTime = performance.now();

    // Get the decrypted API key
    const apiKey = await configStore.getDecryptedKey(
      configStore.activeProvider
    );
    if (!apiKey) {
      throw new Error("No API key found");
    }

    // Create service instance
    const { createAIService } = await import("@/services/ai");
    const service = createAIService(configStore.activeProvider, {
      ...configStore.providers[configStore.activeProvider],
      apiKey,
    });

    // Test the connection
    const result = await service.testConnection();
    const endTime = performance.now();

    lastApiLatency.value = Math.round(endTime - startTime);
    actionResult.value = result;
  } catch (error) {
    actionResult.value = {
      success: false,
      message: error.message,
    };
  } finally {
    testing.value = false;
  }
}

async function clearCache() {
  try {
    // Clear localStorage (except critical items)
    const keysToKeep = ["ommui-onboarding-complete", "ommui-sidebar-collapsed"];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    actionResult.value = {
      success: true,
      message: "Cache cleared successfully",
    };
  } catch (error) {
    actionResult.value = {
      success: false,
      message: "Failed to clear cache",
    };
  }
}

function exportDebugLog() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    system: {
      version: appVersion,
      environment,
      browser: browserInfo.value,
      userAgent: navigator.userAgent,
    },
    provider: {
      active: configStore.activeProvider,
      model: configStore.providers[configStore.activeProvider]?.model,
    },
    storage: {
      conversations: chatStore.conversations.length,
      messages: chatStore.messages.length,
      usage: storageUsed.value,
    },
    errors: errors.value,
    performance: {
      loadTime: loadTime.value,
      memory: memoryUsage.value,
      lastApiLatency: lastApiLatency.value,
    },
  };

  const blob = new Blob([JSON.stringify(debugInfo, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ommui-debug-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  actionResult.value = {
    success: true,
    message: "Debug log exported",
  };
}

async function copyDebugInfo() {
  const info = `ommui Debug Info
Version: ${appVersion}
Environment: ${environment}
Browser: ${browserInfo.value}
Provider: ${configStore.activeProvider || "None"}
Model: ${configStore.providers[configStore.activeProvider]?.model || "N/A"}
Conversations: ${chatStore.conversations.length}
Messages: ${chatStore.messages.length}
Storage: ${storageUsed.value}
Errors: ${errors.value.length}`;

  try {
    await navigator.clipboard.writeText(info);
    actionResult.value = {
      success: true,
      message: "Debug info copied to clipboard",
    };
  } catch (error) {
    actionResult.value = {
      success: false,
      message: "Failed to copy to clipboard",
    };
  }
}

// Initialize
onMounted(() => {
  loadTime.value = Math.round(performance.now());
  checkDBStatus();
  calculateStorage();
  checkMemoryUsage();

  // Update periodically
  setInterval(() => {
    checkMemoryUsage();
    calculateStorage();
  }, 5000);
});

// Clear action result after 3 seconds
watch(actionResult, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      actionResult.value = null;
    }, 3000);
  }
});
</script>

<style scoped>
.bg-secondary {
  background-color: var(--color-bg-secondary);
}
.bg-accent-primary {
  background-color: var(--color-accent-primary);
}
.bg-accent-hover:hover {
  background-color: var(--color-accent-hover);
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
.text-accent-error {
  color: var(--color-accent-error);
}
.border-primary {
  border-color: var(--color-border-primary);
}
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
