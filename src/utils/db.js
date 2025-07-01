// src/utils/db.js
import { openDB } from "idb";

const DB_NAME = "ai-ui-switcher";
const DB_VERSION = 1;

// Initialize database with stores
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for conversations
      if (!db.objectStoreNames.contains("conversations")) {
        const conversationStore = db.createObjectStore("conversations", {
          keyPath: "id",
        });
        conversationStore.createIndex("createdAt", "createdAt");
      }

      // Store for messages
      if (!db.objectStoreNames.contains("messages")) {
        const messageStore = db.createObjectStore("messages", {
          keyPath: "id",
        });
        messageStore.createIndex("conversationId", "conversationId");
        messageStore.createIndex("timestamp", "timestamp");
      }

      // Store for app configuration
      if (!db.objectStoreNames.contains("config")) {
        db.createObjectStore("config");
      }

      // Store for encrypted API keys
      if (!db.objectStoreNames.contains("providers")) {
        db.createObjectStore("providers");
      }
    },
  });
}

// Conversation operations
export async function saveConversation(conversation) {
  const db = await initDB();
  return db.put("conversations", conversation);
}

export async function getConversations() {
  const db = await initDB();
  return db.getAll("conversations");
}

export async function deleteConversation(id) {
  const db = await initDB();
  // Delete conversation
  await db.delete("conversations", id);
  // Delete associated messages
  const tx = db.transaction("messages", "readwrite");
  const index = tx.store.index("conversationId");
  for await (const cursor of index.iterate(id)) {
    await cursor.delete();
  }
  await tx.done;
}

// Message operations
export async function saveMessage(message) {
  const db = await initDB();
  return db.put("messages", message);
}

export async function getMessages(conversationId) {
  const db = await initDB();
  const index = db.transaction("messages").store.index("conversationId");
  return index.getAll(conversationId);
}

// Config operations
export async function saveConfig(key, value) {
  const db = await initDB();
  return db.put("config", value, key);
}

export async function getConfig(key) {
  const db = await initDB();
  return db.get("config", key);
}

// Provider operations (encrypted keys)
export async function saveProvider(name, encryptedData) {
  const db = await initDB();
  return db.put("providers", encryptedData, name);
}

export async function getProvider(name) {
  const db = await initDB();
  return db.get("providers", name);
}

export async function getAllProviders() {
  const db = await initDB();
  return db.getAllKeys("providers");
}

export async function deleteProvider(name) {
  const db = await initDB();
  return db.delete("providers", name);
}
