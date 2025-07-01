import { OpenAIService } from "./openai";
import { GeminiService } from "./gemini";
// import { AnthropicService } from './anthropic' // For later

const services = {
  openai: OpenAIService,
  gemini: GeminiService,
  // anthropic: AnthropicService, // For later
};

export function createAIService(provider, config) {
  const ServiceClass = services[provider];
  if (!ServiceClass) {
    throw new Error(`Unknown AI provider: ${provider}`);
  }
  return new ServiceClass(config);
}
