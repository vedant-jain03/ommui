// src/config/themes.js

export const themes = {
  "claude-style": {
    name: "Claude",
    fonts: {
      sans: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif:
        '"Crimson Text", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    },
    colors: {
      // Background colors
      bg: {
        primary: "#262624", // Main chat background (Claude's actual bg)
        secondary: "#1f1f1c", // Sidebar background (darker variant)
        tertiary: "#0f0f0e", // Selected/hover states
        input: "#3a3a36", // Input field background
        hover: "#3a3a36", // Hover states
      },
      // Text colors
      text: {
        primary: "#ffffff", // Main text (white)
        secondary: "#e3e3e3", // Secondary text
        tertiary: "#c2c0b6", // Muted text
        placeholder: "#8e8e8e", // Placeholder text
      },
      // Accent colors
      accent: {
        primary: "#c76341", // Claude's orange button color\
        secondary: "#d97757",
        hover: "#b5563a", // Hover state (darker)
        user: "#c76341", // User message accent
        error: "#ef4444", // Error states
        text: {
          primary: "#d97757",
        },
      },
      // Border colors
      border: {
        primary: "#3a3a36", // Main borders (same as tertiary bg)
        secondary: "#2a2a28", // Subtle borders
      },
      // Message specific
      message: {
        user: {
          bg: "transparent",
          text: "#ffffff",
        },
        assistant: {
          bg: "#3a3a36", // Slightly lighter than main bg
          text: "#ffffff",
        },
      },
    },
    spacing: {
      chat: {
        maxWidth: "45rem", // 768px - Claude's chat width
        padding: "1.5rem", // Message padding
        gap: "1.5rem", // Gap between messages
      },
    },
    borderRadius: {
      small: "0.375rem", // 6px
      medium: "0.5rem", // 8px
      large: "0.75rem", // 12px
      xl: "1rem", // 16px
    },
    transitions: {
      default: "150ms ease",
      slow: "300ms ease",
    },
  },

  "gpt-style": {
    name: "ChatGPT",
    fonts: {
      sans: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    },
    colors: {
      bg: {
        primary: "#212121", // White main background
        secondary: "#171717", // Light gray sidebar
        tertiary: "#242424", // Hover states
        input: "#ffffff", // Input background
        hover: "#242424", // Hover states
      },
      text: {
        primary: "#ffffff", // Main text (white)
        secondary: "#e3e3e3", // Secondary text
        tertiary: "#a0a0a0", // Muted text
        placeholder: "#8e8e8e", // Placeholder text
      },
      accent: {
        primary: "#10a37f", // GPT green
        hover: "#0d9764", // Darker green
        user: "#ffffff", // User message bg
        error: "#ef4444", // Error red
      },
      border: {
        primary: "#242424", // Light borders
        secondary: "#d9d9d9", // Subtle borders
      },
      message: {
        user: {
          bg: "#ffffff",
          text: "#202123",
        },
        assistant: {
          bg: "#f7f7f8",
          text: "#202123",
        },
      },
    },
    spacing: {
      chat: {
        maxWidth: "48rem",
        padding: "1.5rem",
        gap: "1.5rem",
      },
    },
    borderRadius: {
      small: "0.25rem",
      medium: "0.375rem",
      large: "0.5rem",
      xl: "0.75rem",
    },
    transitions: {
      default: "150ms ease",
      slow: "300ms ease",
    },
  },
};

export function getTheme(themeName) {
  return themes[themeName] || themes["claude-style"];
}
