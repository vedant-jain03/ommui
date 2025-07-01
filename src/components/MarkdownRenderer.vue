<!-- src/components/MarkdownRenderer.vue -->
<template>
  <div class="markdown-content w-[40rem]" v-html="renderedContent"></div>
</template>

<script setup>
import { computed } from "vue";
import MarkdownIt from "markdown-it";

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
});

// Initialize markdown-it with safe defaults
const md = new MarkdownIt({
  html: false, // Disable HTML tags in source
  xhtmlOut: true, // Use '/' to close single tags (<br />)
  breaks: true, // Convert '\n' in paragraphs into <br>
  langPrefix: "language-", // CSS language prefix for fenced blocks
  linkify: true, // Autoconvert URL-like text to links
  typographer: true, // Enable smartquotes and other typographic replacements

  // Highlight function for code blocks
  highlight: function (str, lang) {
    // For now, just escape the HTML
    // Later you can add syntax highlighting with Prism or Highlight.js
    return md.utils.escapeHtml(str);
  },
});

// Enable additional features
md.set({
  // Make sure HTML in markdown is escaped
  html: false,
  // Enable GitHub Flavored Markdown
  breaks: true,
  linkify: true,
});

// Customize link rendering to open in new tab
const defaultLinkRenderer =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  // Add target="_blank" and rel="noopener noreferrer" to links
  const aIndex = tokens[idx].attrIndex("target");
  if (aIndex < 0) {
    tokens[idx].attrPush(["target", "_blank"]);
    tokens[idx].attrPush(["rel", "noopener noreferrer"]);
  }
  return defaultLinkRenderer(tokens, idx, options, env, self);
};

// Custom fence renderer to ensure code blocks are properly escaped
md.renderer.rules.fence = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const info = token.info ? md.utils.unescapeAll(token.info).trim() : "";
  let langName = "";
  let langAttrs = "";

  if (info) {
    const arr = info.split(/(\s+)/g);
    langName = arr[0];
    langAttrs = arr.slice(2).join("");
  }

  const highlighted = options.highlight
    ? options.highlight(token.content, langName, langAttrs) ||
      md.utils.escapeHtml(token.content)
    : md.utils.escapeHtml(token.content);

  const langClass = langName
    ? ` class="${options.langPrefix}${md.utils.escapeHtml(langName)}"`
    : "";

  return `<pre><code${langClass}>${highlighted}</code></pre>\n`;
};

// Also ensure inline code is escaped
md.renderer.rules.code_inline = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  return `<code>${md.utils.escapeHtml(token.content)}</code>`;
};

const renderedContent = computed(() => {
  try {
    // Preprocess the content to handle any quirks
    let processedContent = props.content;

    // Fix escaped triple backticks if any
    processedContent = processedContent.replace(/\\\`\\\`\\\`/g, "```");

    // Ensure proper spacing around code blocks
    processedContent = processedContent.replace(/```(\w*)\s*/g, "\n```$1\n");
    processedContent = processedContent.replace(/\s*```/g, "\n```\n");

    // Render with markdown-it
    const rendered = md.render(processedContent);

    return rendered;
  } catch (error) {
    console.error("Markdown parsing error:", error);
    // If parsing fails, show as escaped plain text
    return `<pre>${md.utils.escapeHtml(props.content)}</pre>`;
  }
});
</script>

<style scoped>
.markdown-content {
  line-height: 1.7;
  word-wrap: break-word;
}

/* Headings */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-family: var(--font-sans);
  font-weight: 600;
  line-height: 1.25;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-content :deep(h1) {
  font-size: 1.875rem;
}
.markdown-content :deep(h2) {
  font-size: 1.5rem;
}
.markdown-content :deep(h3) {
  font-size: 1.25rem;
}
.markdown-content :deep(h4) {
  font-size: 1.125rem;
}
.markdown-content :deep(h5) {
  font-size: 1rem;
}
.markdown-content :deep(h6) {
  font-size: 0.875rem;
}

/* Paragraphs and lists */
.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(li > p) {
  margin-bottom: 0.25rem;
}

/* Strong and emphasis */
.markdown-content :deep(strong),
.markdown-content :deep(b) {
  font-weight: 600;
  color: var(--color-text-primary);
}

.markdown-content :deep(em),
.markdown-content :deep(i) {
  font-style: italic;
}

/* Links */
.markdown-content :deep(a) {
  color: var(--color-accent-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.markdown-content :deep(a:hover) {
  border-bottom-color: var(--color-accent-primary);
}

/* Code */
.markdown-content :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background-color: rgba(255, 255, 255, 0.08);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 400;
}

.markdown-content :deep(pre) {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.5;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-secondary);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  font-size: inherit;
}

/* Blockquotes */
.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--color-border-primary);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* Tables */
.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--color-border-secondary);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: rgba(255, 255, 255, 0.05);
  font-weight: 600;
}

/* Horizontal rule */
.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border-secondary);
  margin: 2rem 0;
}

/* Images */
.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

/* Task lists */
.markdown-content :deep(input[type="checkbox"]) {
  margin-right: 0.5rem;
}

/* Nested lists */
.markdown-content :deep(ul ul),
.markdown-content :deep(ol ol),
.markdown-content :deep(ul ol),
.markdown-content :deep(ol ul) {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}
</style>
