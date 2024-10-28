import { OpenAIProvider } from '@/lib/ai/providers/openai-provider';
import { BaseAIProvider } from '@/lib/ai/providers/base-provider';

export class AIProviderFactory {
  static createProvider(model: string): BaseAIProvider {
    const apiKey = process.env.OPENAI_API_KEY!;
    
    if (model === 'o1-mini' || model.includes('gpt-4')) {
      return new OpenAIProvider(apiKey, model);
    }
    
    throw new Error(`Unsupported model: ${model}`);
  }
}
