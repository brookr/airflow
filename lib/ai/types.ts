export type AIAction = 'regenerate' | 'expound' | 'condense';

export interface AIRequestPayload {
  action: AIAction;
  selectedText: string;
  fullArticle: string;
  metadata: Record<string, string>;
}

export interface AIResponse {
  replacementText: string;
}

export interface ModelConfig {
  modelName: string;
  supportsStructuredOutput: boolean;
  supportsSystemPrompt: boolean;
}
