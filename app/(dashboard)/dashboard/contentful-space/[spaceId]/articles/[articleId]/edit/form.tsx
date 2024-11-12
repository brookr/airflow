"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Editor } from "@tinymce/tinymce-react";
import { Card, CardContent } from "@/components/ui/card";

interface ArticleData {
  fields: {
    title: {
      "en-US": string;
    };
    slug: {
      "en-US": string;
    };
    content: {
      "en-US": {
        nodeType: "document";
        content: Array<{
          nodeType: string;
          content: Array<{
            nodeType: string;
            value: string;
          }>;
        }>;
      };
    };
  };
}

export function ContentfulArticleForm({
  spaceId,
  articleId,
}: {
  spaceId: string;
  articleId: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [editorHeight, setEditorHeight] = useState<number>(600);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(
          `/api/contentful/spaces/${spaceId}/articles/${articleId}`
        );
        const data = await response.json();
        setTitle(data.fields.title["en-US"]);
        setSlug(data.fields.slug["en-US"]);
        
        // Convert Contentful Rich Text to HTML
        const richTextContent = data.fields.content["en-US"];
        const htmlContent = richTextToHtml(richTextContent);
        setContent(htmlContent);
      } catch (error) {
        console.error("Failed to fetch article:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [spaceId, articleId]);

  const richTextToHtml = (richText: any): string => {
    if (!richText || !richText.content) return '';

    return richText.content.map((node: any) => {
      switch (node.nodeType) {
        case 'paragraph':
          return `<p>${node.content.map((textNode: any) => textNode.value).join('')}</p>`;
        case 'heading-1':
          return `<h1>${node.content.map((textNode: any) => textNode.value).join('')}</h1>`;
        case 'heading-2':
          return `<h2>${node.content.map((textNode: any) => textNode.value).join('')}</h2>`;
        case 'heading-3':
          return `<h3>${node.content.map((textNode: any) => textNode.value).join('')}</h3>`;
        case 'unordered-list':
          return `<ul>${node.content.map((listItem: any) => 
            `<li>${listItem.content.map((textNode: any) => textNode.value).join('')}</li>`
          ).join('')}</ul>`;
        case 'ordered-list':
          return `<ol>${node.content.map((listItem: any) => 
            `<li>${listItem.content.map((textNode: any) => textNode.value).join('')}</li>`
          ).join('')}</ol>`;
        default:
          return node.content?.map((textNode: any) => textNode.value).join('') || '';
      }
    }).join('');
  };

  const htmlToRichText = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content: any[] = [];

    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        switch (element.tagName.toLowerCase()) {
          case 'p':
            content.push({
              nodeType: 'paragraph',
              content: [{
                nodeType: 'text',
                value: element.textContent || '',
              }],
            });
            break;
          case 'h1':
            content.push({
              nodeType: 'heading-1',
              content: [{
                nodeType: 'text',
                value: element.textContent || '',
              }],
            });
            break;
          case 'h2':
            content.push({
              nodeType: 'heading-2',
              content: [{
                nodeType: 'text',
                value: element.textContent || '',
              }],
            });
            break;
          case 'h3':
            content.push({
              nodeType: 'heading-3',
              content: [{
                nodeType: 'text',
                value: element.textContent || '',
              }],
            });
            break;
          // Add more cases for other HTML elements as needed
        }
      }
    });

    return {
      nodeType: 'document' as const,
      content,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const richTextContent = htmlToRichText(content);
    const articleData: ArticleData = {
      fields: {
        title: { "en-US": title },
        slug: { "en-US": slug },
        content: { "en-US": richTextContent },
      },
    };

    try {
      const response = await fetch(
        `/api/contentful/spaces/${spaceId}/articles/${articleId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData),
        }
      );

      if (response.ok) {
        router.push(`/dashboard/contentful-space/${spaceId}`);
      }
    } catch (error) {
      console.error("Failed to update article:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading article...</div>;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article Title"
              required
            />
          </div>
          <div>
            <Input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="article-slug"
              required
            />
          </div>
          <div>
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              value={content}
              onEditorChange={(newContent) => setContent(newContent)}
              init={{
                min_height: editorHeight,
                height: 'auto',
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount', 'autoresize'
                ],
                toolbar: [
                  'undo redo | h1 h2 h3 | bullist numlist outdent indent |',
                  'removeformat | help'
                ],
                branding: false,
                resize: true,
                autoresize_bottom_margin: 0,
                autoresize_min_height: editorHeight,
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
