import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface AIFieldGeneratorProps {
  fieldName: string;
  currentValue: string;
  onGenerate: (value: string) => void;
  context: {
    content: string;
    title?: string;
    subtitle?: string;
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
    category?: string;
    tags?: string;
  };
}

export function AIFieldGenerator({ fieldName, currentValue, onGenerate, context }: AIFieldGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          selectedText: currentValue,
          fullArticle: context.content,
          metadata: {
            fieldToGenerate: fieldName,
            title: context.title,
            subtitle: context.subtitle,
            metaTitle: context.metaTitle,
            metaDescription: context.metaDescription,
            slug: context.slug,
            category: context.category,
            tags: context.tags,
            instructions: `Generate a compelling ${fieldName} based on the article content and other metadata.`
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to generate content');
      
      const data = await response.json();
      onGenerate(data.replacementText);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleGenerate}
      disabled={isGenerating}
      className="h-8 w-8"
    >
      <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-pulse' : ''}`} />
    </Button>
  );
}
