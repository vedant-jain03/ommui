<!-- src/components/WelcomeScreen.vue -->
<template>
  <div class="welcome-container">
    <!-- Provider Badge -->
    <div class="provider-badge" v-if="currentProvider">
      <component :is="providerIcon" class="w-4 h-4" />
      <span>{{ currentProvider.name }}</span>
    </div>
    <!-- Welcome Message -->
    <div class="welcome-content">
      <h1 class="welcome-title">
        <span class="emoji">{{ greeting.emoji }}</span>
        {{ greeting.message }}
      </h1>
    </div>
    <div class="w-[40rem]">
      <MessageInput
        :disabled="!configStore.hasActiveProvider || isLoading"
        :is-loading="isLoading"
        @send="sendMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useConfigStore } from "@/stores/config";
import { useChat } from "@/composables/useChat";
import {
  Sparkles,
  Bot,
  Brain,
  Code2,
  PenTool,
  Briefcase,
  Heart,
  Lightbulb,
  Rocket,
  Search,
  BookOpen,
  Palette,
} from "lucide-vue-next";
import MessageInput from "./MessageInput.vue";

const emit = defineEmits(["use-prompt", "quick-action"]);

const configStore = useConfigStore();
const { isLoading, streamingMessage, sendMessage, regenerateLastResponse } =
  useChat();
// Get current provider info
const currentProvider = computed(() => {
  if (!configStore.activeProvider) return null;

  const providers = {
    openai: { name: "GPT-4", icon: Bot },
    gemini: { name: "Gemini", icon: Brain },
    anthropic: { name: "Claude", icon: Sparkles },
  };

  return providers[configStore.activeProvider];
});

const providerIcon = computed(() => currentProvider.value?.icon || Bot);

// Dynamic greeting based on time of day
const greeting = computed(() => {
  const hour = new Date().getHours();
  const name = getUserName(); // You can implement this to get from localStorage or config

  if (hour < 12) {
    return {
      emoji: "🌅",
      message: name ? `Good morning, ${name}!` : "Good morning!",
    };
  } else if (hour < 17) {
    return {
      emoji: "☀️",
      message: name ? `Good afternoon, ${name}!` : "Good afternoon!",
    };
  } else {
    return {
      emoji: "🌙",
      message: name ? `Good evening, ${name}!` : "Good evening!",
    };
  }
});

// Quick action buttons
const quickActions = [
  {
    id: "code",
    icon: Code2,
    label: "Code",
    hint: "Debug, write, or explain code",
  },
  {
    id: "write",
    icon: PenTool,
    label: "Write",
    hint: "Essays, emails, or creative writing",
  },
  {
    id: "analyze",
    icon: Search,
    label: "Analyze",
    hint: "Research and break down topics",
  },
  {
    id: "create",
    icon: Palette,
    label: "Create",
    hint: "Brainstorm and generate ideas",
  },
];

// Example prompts that rotate or are contextual
const examplePrompts = computed(() => {
  const allPrompts = [
    "Help me write a professional email",
    "Explain quantum computing simply",
    "Debug my Python code",
    "Plan a 7-day trip to Japan",
    "Create a workout routine",
    "Write a short story about time travel",
    "Analyze this business strategy",
    "Help me learn Spanish basics",
    "Design a mobile app concept",
    "Solve this math problem",
  ];

  // Return random 4 prompts
  return allPrompts.sort(() => 0.5 - Math.random()).slice(0, 4);
});

function handleQuickAction(action) {
  emit("quick-action", action.id);

  // You can also directly set prompts based on action
  const actionPrompts = {
    code: "Help me write a function that ",
    write: "Help me write ",
    analyze: "Analyze and explain ",
    create: "Help me brainstorm ideas for ",
  };

  if (actionPrompts[action.id]) {
    emit("use-prompt", actionPrompts[action.id]);
  }
}

function getUserName() {
  // Get from localStorage or config
  return localStorage.getItem("ommui-user-name") || "";
}
</script>

<style scoped>
.welcome-container {
  height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.provider-badge {
  position: absolute;
  top: 8rem;
  right: 7rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-bg-tertiary);
  border-radius: 9999px;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-primary);
}

.welcome-content {
  max-width: 48rem;
  width: 100%;
  text-align: center;
}

.welcome-title {
  font-size: 3rem;
  font-weight: 600;
  margin-bottom: 3rem;
  color: var(--color-text-tertiary);
  font-family: var(--font-serif);
}

.emoji {
  display: inline-block;
  margin-right: 5px;
  animation: wave 2s ease-in-out infinite;
}

@keyframes wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: 0.75rem;
  transition: all 0.2s;
  cursor: pointer;
}

.action-card:hover {
  background-color: var(--color-bg-tertiary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 2rem;
  height: 2rem;
  color: var(--color-accent-primary);
}

.action-label {
  font-weight: 600;
  color: var(--color-text-primary);
}

.action-hint {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.prompts-section {
  text-align: left;
}

.prompts-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.prompt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
}

.prompt-card {
  padding: 1rem;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: 0.5rem;
  text-align: left;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  transition: all 0.2s;
  cursor: pointer;
}

.prompt-card:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border-color: var(--color-accent-primary);
}

/* Dark theme adjustments */
@media (prefers-color-scheme: dark) {
  .action-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}
</style>
