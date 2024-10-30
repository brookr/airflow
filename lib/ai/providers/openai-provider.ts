import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { BaseAIProvider } from "@/lib/ai/providers/base-provider";
import { AIRequestPayload, AIResponse } from "@/lib/ai/types";

const RegeneratedContent = z.object({
  replacementText: z.string()
});

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(apiKey: string, modelName: string) {
    const config = {
      modelName,
      supportsStructuredOutput: modelName.includes('gpt-4'),
      supportsSystemPrompt: modelName.includes('gpt-4')
    };
    super(config);
    this.client = new OpenAI({ apiKey });
  }

  async generateContent(payload: AIRequestPayload): Promise<AIResponse> {
    if (this.config.supportsStructuredOutput) {
      return this.generateStructuredResponse(payload);
    }
    return this.generateBasicResponse(payload);
  }

  private async generateStructuredResponse(payload: AIRequestPayload): Promise<AIResponse> {
    const completion = await this.client.beta.chat.completions.parse({
      model: this.config.modelName,
      messages: [
        {
          role: "system",
          content: `You are an expert content editor. Your task is to ${this.getPromptForAction(payload.action)}`
        },
        {
          role: "user",
          content: this.formatPrompt(payload)
        }
      ],
      response_format: zodResponseFormat(RegeneratedContent, "replacement")
    });

    const replacementText = completion.choices[0]?.message?.parsed?.replacementText;
    if (!replacementText) {
      throw new Error('Invalid AI response format');
    }

    return { replacementText };
  }

  private async generateBasicResponse(payload: AIRequestPayload): Promise<AIResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.config.modelName,
      messages: [
        {
          role: "user",
          content: `You are an expert content editor. Your task is to ${this.getPromptForAction(payload.action)}\n\n${this.formatPrompt(payload)}`
        }
      ]
    });

    return {
      replacementText: completion.choices[0].message.content || ''
    };
  }

  private formatPrompt(payload: AIRequestPayload): string {
    const { action, selectedText, fullArticle, metadata } = payload;
    const instructions = metadata.instructions ? `\n${metadata.instructions}` : `\nBe very mindful of SEO best practices.`;
    
    return `
      I need you to ${action} this portion of the article. Specifically, be very mindful of SEO best practices and be sure to follow these instructions very carefully:
      ${instructions}
      
      ARTICLE METADATA:
      ${Object.entries(metadata)
        .filter(([key]) => key !== 'instructions')
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')}
      
      FULL ARTICLE:
      ${fullArticle}
      
      SELECTED TEXT TO ${action.toUpperCase()}:
      ${selectedText}
      
      Please provide ONLY the new text without any formatting, labels, or markdown. Do not include field names like "Subtitle:" or "Title:". Just return the plain text that should replace the selected text.
    `;
  }
}
