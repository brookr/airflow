"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/auth";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Editor } from "@tinymce/tinymce-react";
import { EditableField } from "@/components/ui/editable-field";
import { Rocket } from "lucide-react";
import { ContentfulConnection } from "@/lib/db/schema";

interface ArticleData {
  sys: {
    id: string;
    version: number;
  };
  fields: {
    title: {
      "en-US": string;
    };
    slug: {
      "en-US": string;
    };
    content: {
      "en-US": {
        nodeType: string;
        content: Array<{
          nodeType: string;
          content: Array<{
            nodeType: string;
            value: string;
            marks?: Array<{ type: string }>;
          }>;
        }>;
      };
    };
  };
}

interface ContentTypeField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  localized: boolean;
  validations?: any[];
}

interface ContentType {
  sys: {
    id: string;
  };
  name: string;
  fields: ContentTypeField[];
}

export default function EditArticlePage() {
  const { spaceId, articleId } = useParams();
  const { user } = useUser();
  const router = useRouter();

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [contentChanged, setContentChanged] = useState(false);
  const [editorHeight, setEditorHeight] = useState<number>(600);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isStatusVisible, setIsStatusVisible] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<{
    [key: string]: any;
  }>({});
  const [contentType, setContentType] = useState<ContentType | null>(null);

  useEffect(() => {
    if (!user?.teamId) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch content type first
        const contentTypeResponse = await fetch(
          `/api/contentful/spaces/${spaceId}/content-types`
        );
        if (!contentTypeResponse.ok) {
          throw new Error('Failed to fetch content type');
        }
        const contentTypeData = await contentTypeResponse.json();
        setContentType(contentTypeData.contentType);

        // Then fetch article
        const articleResponse = await fetch(
          `/api/contentful/spaces/${spaceId}/articles/${articleId}`
        );
        if (!articleResponse.ok) {
          throw new Error('Failed to fetch article');
        }
        const articleData = await articleResponse.json();
        setArticle(articleData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.teamId, spaceId, articleId, router]);

  const handleFieldUpdate = async (fieldId: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [fieldId]: value
    }));
    setContentChanged(true);
  };

  const handlePublish = async () => {
    if (!article || Object.keys(pendingChanges).length === 0) return;

    setIsUploading(true);
    try {
      const updatedArticle = {
        ...article,
        fields: {
          ...article.fields,
          ...Object.entries(pendingChanges).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: { "en-US": value }
          }), {})
        }
      };

      const response = await fetch(
        `/api/contentful/spaces/${spaceId}/articles/${articleId}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "X-Contentful-Version": article.sys.version.toString()
          },
          body: JSON.stringify(updatedArticle),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to publish changes');
      }

      const newArticle = await response.json();
      setArticle(newArticle);
      setPendingChanges({});
      setContentChanged(false);
      setUploadStatus({
        type: 'success',
        message: 'Changes published successfully'
      });
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to publish changes'
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (uploadStatus?.type === 'success') {
      setIsStatusVisible(true);
      const fadeTimer = setTimeout(() => {
        setIsStatusVisible(false);
      }, 2700);

      const removeTimer = setTimeout(() => {
        setUploadStatus(null);
      }, 3000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [uploadStatus]);

  const richTextToHtml = (richText: any): string => {
    if (!richText || !richText.content) return '';

    return richText.content.map((node: any) => {
      switch (node.nodeType) {
        case 'paragraph':
          return `<p>${node.content.map((textNode: any) => {
            const text = textNode.value;
            if (textNode.marks) {
              return textNode.marks.reduce((acc: string, mark: { type: string }) => {
                switch (mark.type) {
                  case 'bold':
                    return `<strong>${acc}</strong>`;
                  case 'italic':
                    return `<em>${acc}</em>`;
                  default:
                    return acc;
                }
              }, text);
            }
            return text;
          }).join('')}</p>`;
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

    const processNode = (node: Element): any => {
      const textContent = node.textContent || '';
      switch (node.tagName.toLowerCase()) {
        case 'p':
          return {
            nodeType: 'paragraph',
            content: [{
              nodeType: 'text',
              value: textContent,
            }],
          };
        case 'h1':
          return {
            nodeType: 'heading-1',
            content: [{
              nodeType: 'text',
              value: textContent,
            }],
          };
        case 'h2':
          return {
            nodeType: 'heading-2',
            content: [{
              nodeType: 'text',
              value: textContent,
            }],
          };
        case 'h3':
          return {
            nodeType: 'heading-3',
            content: [{
              nodeType: 'text',
              value: textContent,
            }],
          };
        case 'ul':
          return {
            nodeType: 'unordered-list',
            content: Array.from(node.children).map(li => ({
              nodeType: 'list-item',
              content: [{
                nodeType: 'text',
                value: li.textContent || '',
              }],
            })),
          };
        case 'ol':
          return {
            nodeType: 'ordered-list',
            content: Array.from(node.children).map(li => ({
              nodeType: 'list-item',
              content: [{
                nodeType: 'text',
                value: li.textContent || '',
              }],
            })),
          };
        default:
          return null;
      }
    };

    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const processedNode = processNode(element);
        if (processedNode) {
          content.push(processedNode);
        }
      }
    });

    return {
      nodeType: 'document',
      content,
    };
  };

  const renderField = (field: ContentTypeField) => {
    const value = pendingChanges[field.id] ?? article?.fields[field.id]?.["en-US"] ?? "";
    
    switch (field.type) {
      case 'Symbol':
      case 'Text':
        return (
          <EditableField
            key={field.id}
            label={field.name}
            name={field.id}
            value={value}
            onChange={(value) => handleFieldUpdate(field.id, value)}
            required={field.required}
            context={{
              content: richTextToHtml(pendingChanges.content ?? article?.fields.content["en-US"]),
              title: pendingChanges.title ?? article?.fields.title["en-US"],
            }}
          />
        );
      case 'RichText':
        return null; // Skip rich text field as it's handled in the main content area
      case 'Array':
        return (
          <EditableField
            key={field.id}
            label={field.name}
            name={field.id}
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(value) => handleFieldUpdate(field.id, value.split(',').map(v => v.trim()))}
            type="textarea"
            placeholder={`Enter ${field.name.toLowerCase()} separated by commas`}
            required={field.required}
          />
        );
      default:
        return (
          <EditableField
            key={field.id}
            label={field.name}
            name={field.id}
            value={value}
            onChange={(value) => handleFieldUpdate(field.id, value)}
            required={field.required}
          />
        );
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!article) return null;

  return (
    <div className="flex-1 p-4 lg:p-8 w-full">
      <form className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <EditableField
              label="Title"
              name="title"
              value={pendingChanges.title ?? article.fields.title["en-US"]}
              onChange={(value) => handleFieldUpdate("title", value)}
              className="text-2xl font-bold"
              context={{
                content: richTextToHtml(pendingChanges.content ?? article.fields.content["en-US"]),
                slug: pendingChanges.slug ?? article.fields.slug["en-US"],
              }}
            />

            <EditableField
              label="Subtitle"
              name="subtitle"
              value={pendingChanges.subtitle ?? article.fields.subtitle?.["en-US"] || ""}
              onChange={(value) => handleFieldUpdate("subtitle", value)}
              className="text-lg text-muted-foreground"
              context={{
                content: richTextToHtml(pendingChanges.content ?? article.fields.content["en-US"]),
                title: pendingChanges.title ?? article.fields.title["en-US"],
              }}
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="content" className="block text-sm font-medium">Content</label>
              </div>
              {!isEditingContent ? (
                <div 
                  onClick={() => setIsEditingContent(true)}
                  className="relative cursor-text p-4 border rounded-md hover:border-primary/50 group min-h-[400px]"
                >
                  <div className="absolute inset-0 z-10 group-hover:bg-primary/5" />
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: richTextToHtml(pendingChanges.content ?? article.fields.content["en-US"]) 
                    }} 
                  />
                </div>
              ) : (
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  value={richTextToHtml(pendingChanges.content ?? article.fields.content["en-US"])}
                  init={{
                    min_height: editorHeight,
                    height: 'auto',
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
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
                  }}
                  onEditorChange={(content) => {
                    handleFieldUpdate("content", htmlToRichText(content));
                  }}
                  onBlur={() => setIsEditingContent(false)}
                />
              )}
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-80 space-y-4">
          <div className="bg-muted/10 p-4 rounded-lg space-y-4">
            <Button
              type="button"
              onClick={handlePublish}
              className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700"
              disabled={isUploading || Object.keys(pendingChanges).length === 0}
            >
              {isUploading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  {Object.keys(pendingChanges).length > 0 ? 'Publish Changes' : 'No Changes'}
                </>
              )}
            </Button>

            {uploadStatus && (
              <div 
                className={`mt-2 p-4 rounded-md transition-opacity duration-300 ease-in-out ${
                  uploadStatus.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                } ${isStatusVisible ? 'opacity-100' : 'opacity-0'}`}
              >
                {uploadStatus.message}
              </div>
            )}

            <div className="pt-4 border-t space-y-4">
              <h3 className="font-medium">Fields</h3>
              {contentType?.fields
                .filter(field => field.type !== 'RichText') // Skip rich text field as it's in main content
                .map(field => renderField(field))
              }
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/contentful-space/${spaceId}`)}
              className="w-full mt-4"
            >
              Back to Articles
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
} 
