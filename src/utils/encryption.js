// src/utils/encryption.js

// Generate a key from a password
async function generateKey(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

// Encrypt data
export async function encrypt(text, password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const key = await generateKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );

  // Combine iv and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

// Decrypt data
export async function decrypt(encryptedBase64, password) {
  // Convert from base64
  const combined = Uint8Array.from(atob(encryptedBase64), (c) =>
    c.charCodeAt(0)
  );

  // Extract iv and data
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const key = await generateKey(password);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Generate a user-specific encryption key based on a master password
// In a real app, you might want to use a more sophisticated approach
export function getUserEncryptionKey() {
  // For now, we'll use a combination of factors
  // In production, you might want to ask user for a master password
  const factors = [
    navigator.userAgent,
    new Date().toDateString(),
    "ai-ui-switcher-v1", // app-specific salt
  ];
  return factors.join("-");
}
