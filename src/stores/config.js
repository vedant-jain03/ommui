// src/stores/config.js
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import {
  saveConfig,
  getConfig,
  saveProvider,
  getProvider,
  getAllProviders,
  deleteProvider,
} from "@/utils/db";
import { encrypt, decrypt, getUserEncryptionKey } from "@/utils/encryption";

export const useConfigStore = defineStore("config", () => {
  const currentUI = ref("claude-style");
  const activeProvider = ref("");
  const providers = ref({});
  const preferences = ref({
    theme: "light",
    fontSize: "medium",
    streamResponses: true,
  });

  const hasActiveProvider = computed(
    () => !!activeProvider.value && !!providers.value[activeProvider.value]
  );

  // Load config from IndexedDB on startup
  async function loadFromDB() {
    try {
      // Load preferences
      const savedPreferences = await getConfig("preferences");
      if (savedPreferences) {
        preferences.value = savedPreferences;
      }

      // Load UI preference
      const savedUI = await getConfig("currentUI");
      if (savedUI) {
        currentUI.value = savedUI;
      }

      // Load active provider
      const savedActiveProvider = await getConfig("activeProvider");
      if (savedActiveProvider) {
        activeProvider.value = savedActiveProvider;
      }

      // Load all providers (without decrypting keys yet)
      const providerNames = await getAllProviders();
      for (const name of providerNames) {
        const encryptedData = await getProvider(name);
        providers.value[name] = {
          ...encryptedData,
          key: "***encrypted***", // Don't store decrypted key in memory
        };
      }
    } catch (error) {
      console.error("Error loading config from DB:", error);
    }
  }

  // Save provider with encrypted key
  async function setProvider(providerName, config) {
    try {
      const encryptionKey = getUserEncryptionKey();
      const encryptedKey = await encrypt(config.key, encryptionKey);

      const providerData = {
        ...config,
        key: encryptedKey,
        addedAt: new Date().toISOString(),
      };

      await saveProvider(providerName, providerData);
      providers.value[providerName] = {
        ...config,
        key: "***encrypted***",
      };
    } catch (error) {
      console.error("Error saving provider:", error);
      throw error;
    }
  }

  // Get decrypted API key when needed
  async function getDecryptedKey(providerName) {
    try {
      const encryptedData = await getProvider(providerName);
      if (!encryptedData) return null;

      const encryptionKey = getUserEncryptionKey();
      return await decrypt(encryptedData.key, encryptionKey);
    } catch (error) {
      console.error("Error decrypting key:", error);
      throw error;
    }
  }

  async function removeProvider(providerName) {
    await deleteProvider(providerName);
    delete providers.value[providerName];
    if (activeProvider.value === providerName) {
      activeProvider.value = "";
    }
  }

  function setActiveProvider(providerName) {
    activeProvider.value = providerName;
    saveConfig("activeProvider", providerName);
  }

  function setUI(uiName) {
    currentUI.value = uiName;
    saveConfig("currentUI", uiName);
  }

  function updatePreferences(newPreferences) {
    preferences.value = { ...preferences.value, ...newPreferences };
    saveConfig("preferences", preferences.value);
  }

  // Watch for changes and persist
  watch(
    preferences,
    (newVal) => {
      saveConfig("preferences", newVal);
    },
    { deep: true }
  );

  return {
    currentUI,
    activeProvider,
    providers,
    preferences,
    hasActiveProvider,
    loadFromDB,
    setProvider,
    getDecryptedKey,
    removeProvider,
    setActiveProvider,
    setUI,
    updatePreferences,
  };
});
