import { AIProviderFactory } from '@/lib/ai/factory';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { action, selectedText, fullArticle, metadata, model = 'o1-mini' } = await req.json();
    
    const provider = AIProviderFactory.createProvider(model);
    const result = await provider.generateContent({
      action,
      selectedText,
      fullArticle,
      metadata
    });

    return new Response(JSON.stringify(result));

  } catch (error) {
    console.error('AI API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process content' }), 
      { status: 500 }
    );
  }
}
