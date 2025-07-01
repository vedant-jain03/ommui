// src/composables/useSidebar.js
import { ref, watch } from "vue";
import { useStorage } from "@vueuse/core";

export function useSidebar() {
  // Use localStorage to persist sidebar state
  const sidebarCollapsed = useStorage("ommui-sidebar-collapsed", false);

  // Toggle function
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  // Set specific state
  const setSidebarState = (collapsed) => {
    sidebarCollapsed.value = collapsed;
  };

  return {
    sidebarCollapsed,
    toggleSidebar,
    setSidebarState,
  };
}
