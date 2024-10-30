import { AIRequestPayload, AIResponse, ModelConfig } from '@/lib/ai/types';

export abstract class BaseAIProvider {
  protected config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  abstract generateContent(payload: AIRequestPayload): Promise<AIResponse>;
  
  protected getPromptForAction(action: string): string {
    const actionPrompts = {
      regenerate: "Regenerate this text while maintaining consistency with the surrounding content.",
      expound: "Expand this text with more specific details while maintaining consistency with the surrounding content.",
      condense: "Condense this text to be more concise while maintaining key information and consistency with the surrounding content."
    };
    return actionPrompts[action as keyof typeof actionPrompts] || "";
  }
}
