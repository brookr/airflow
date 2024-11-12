"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/auth";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Editor } from "@tinymce/tinymce-react";
import { EditableField } from "@/components/ui/editable-field";
import { Rocket } from "lucide-react";
import { ContentfulConnection } from "@/lib/db/schema";
import { AIFieldGenerator } from "@/components/ui/ai-field-generator";

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
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isStatusVisible, setIsStatusVisible] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<{
    [key: string]: any;
  }>({});
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4");

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
          throw new Error("Failed to fetch content type");
        }
        const contentTypeData = await contentTypeResponse.json();
        setContentType(contentTypeData.contentType);

        // Then fetch article
        const articleResponse = await fetch(
          `/api/contentful/spaces/${spaceId}/articles/${articleId}`
        );
        if (!articleResponse.ok) {
          throw new Error("Failed to fetch article");
        }
        const articleData = await articleResponse.json();
        setArticle(articleData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.teamId, spaceId, articleId, router]);

  const handleFieldUpdate = async (fieldId: string, value: any) => {
    setPendingChanges((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    setContentChanged(true);
  };

  const handlePublish = async () => {
    if (!article || Object.keys(pendingChanges).length === 0) return;

    setIsUploading(true);
    try {
      const updatedArticle = {
        ...article,
        fields: Object.entries(pendingChanges).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: { "en-US": value },
          }),
          { ...article.fields }
        ),
      };

      const response = await fetch(
        `/api/contentful/spaces/${spaceId}/articles/${articleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Contentful-Version": article.sys.version.toString(),
          },
          body: JSON.stringify(updatedArticle),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || 'Failed to publish changes';
        
        // Extract and format validation errors if present
        if (errorMessage.includes('validation error:')) {
          try {
            const validationErrors = JSON.parse(errorMessage.split('validation error:')[1]);
            errorMessage = validationErrors.map((err: any) => 
              `${err.path.join('.')}: ${err.name} - ${err.details}`
            ).join('\n');
          } catch (e) {
            console.error('Failed to parse validation errors:', e);
          }
        }

        setUploadStatus({
          type: 'error',
          message: errorMessage
        });
        return;
      }

      setArticle(data);
      setPendingChanges({});
      setContentChanged(false);
      setUploadStatus({
        type: "success",
        message: "Changes published successfully",
      });
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to publish changes",
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (uploadStatus?.type === "success") {
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
    if (!richText || !richText.content) return "";

    return richText.content
      .map((node: any) => {
        switch (node.nodeType) {
          case "paragraph":
            return `<p>${node.content
              .map((textNode: any) => {
                const text = textNode.value;
                if (textNode.marks) {
                  return textNode.marks.reduce(
                    (acc: string, mark: { type: string }) => {
                      switch (mark.type) {
                        case "bold":
                          return `<strong>${acc}</strong>`;
                        case "italic":
                          return `<em>${acc}</em>`;
                        default:
                          return acc;
                      }
                    },
                    text
                  );
                }
                return text;
              })
              .join("")}</p>`;
          case "heading-1":
            return `<h1>${node.content
              .map((textNode: any) => textNode.value)
              .join("")}</h1>`;
          case "heading-2":
            return `<h2>${node.content
              .map((textNode: any) => textNode.value)
              .join("")}</h2>`;
          case "heading-3":
            return `<h3>${node.content
              .map((textNode: any) => textNode.value)
              .join("")}</h3>`;
          case "unordered-list":
            return `<ul>${node.content
              .map(
                (listItem: any) =>
                  `<li>${listItem.content
                    .map((textNode: any) => textNode.value)
                    .join("")}</li>`
              )
              .join("")}</ul>`;
          case "ordered-list":
            return `<ol>${node.content
              .map(
                (listItem: any) =>
                  `<li>${listItem.content
                    .map((textNode: any) => textNode.value)
                    .join("")}</li>`
              )
              .join("")}</ol>`;
          default:
            return (
              node.content?.map((textNode: any) => textNode.value).join("") ||
              ""
            );
        }
      })
      .join("");
  };

  const htmlToRichText = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const content: any[] = [];

    const processNode = (node: Element): any => {
      const textContent = node.textContent || "";
      switch (node.tagName.toLowerCase()) {
        case "p":
          return {
            nodeType: "paragraph",
            content: [
              {
                nodeType: "text",
                value: textContent,
              },
            ],
          };
        case "h1":
          return {
            nodeType: "heading-1",
            content: [
              {
                nodeType: "text",
                value: textContent,
              },
            ],
          };
        case "h2":
          return {
            nodeType: "heading-2",
            content: [
              {
                nodeType: "text",
                value: textContent,
              },
            ],
          };
        case "h3":
          return {
            nodeType: "heading-3",
            content: [
              {
                nodeType: "text",
                value: textContent,
              },
            ],
          };
        case "ul":
          return {
            nodeType: "unordered-list",
            content: Array.from(node.children).map((li) => ({
              nodeType: "list-item",
              content: [
                {
                  nodeType: "text",
                  value: li.textContent || "",
                },
              ],
            })),
          };
        case "ol":
          return {
            nodeType: "ordered-list",
            content: Array.from(node.children).map((li) => ({
              nodeType: "list-item",
              content: [
                {
                  nodeType: "text",
                  value: li.textContent || "",
                },
              ],
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
      nodeType: "document",
      content,
    };
  };

  const renderField = (field: ContentTypeField) => {
    const value =
      pendingChanges[field.id] ?? article?.fields[field.id]?.["en-US"] ?? "";
    console.log("field:", field);
    switch (field.type) {
      case "Symbol":
      case "Text":
        return (
          <EditableField
            key={field.id}
            label={field.name}
            name={field.id}
            value={value}
            onChange={(value) => handleFieldUpdate(field.id, value)}
            context={{
              content: richTextToHtml(
                pendingChanges.content ?? article?.fields.content["en-US"]
              ),
              title: pendingChanges.title ?? article?.fields.title["en-US"],
            }}
          />
        );
      case "RichText":
        return null; // Skip rich text field as it's handled in the main content area
      case "Array":
        return (
          <EditableField
            key={field.id}
            label={field.name}
            name={field.id}
            value={Array.isArray(value) ? value.join(", ") : value}
            onChange={(value) =>
              handleFieldUpdate(
                field.id,
                value.split(",").map((v) => v.trim())
              )
            }
            type="textarea"
            placeholder={`Enter ${field.name.toLowerCase()} separated by commas`}
          />
        );
      case "Link":
        if (
          field.validations?.find((v) =>
            v.linkContentType?.includes("Asset")
          ) ||
          field.linkType === "Asset"
        ) {
          // Handle media/image field
          console.log("asset:", value);
          const assetData = value?.fields?.file ?? value;
          const assetUrl = assetData?.url;
          const assetType = assetData?.contentType;
          const assetTitle = value?.fields?.title?.["en-US"] || field.name;

          return (
            <div key={field.id} className="space-y-2">
              <label className="text-sm font-medium">{field.name}</label>
              {assetUrl && (
                <div className="relative w-full mb-4 bg-muted/30 rounded-lg overflow-hidden">
                  {assetType?.startsWith("image/") ? (
                    <div className="aspect-video">
                      <img
                        src={
                          assetUrl.startsWith("//")
                            ? `https:${assetUrl}`
                            : assetUrl
                        }
                        alt={assetTitle}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : assetType?.startsWith("video/") ? (
                    <video
                      controls
                      className="w-full"
                      src={
                        assetUrl.startsWith("//")
                          ? `https:${assetUrl}`
                          : assetUrl
                      }
                    >
                      <source src={assetUrl} type={assetType} />
                      Your browser does not support the video tag.
                    </video>
                  ) : assetType?.startsWith("audio/") ? (
                    <audio
                      controls
                      className="w-full"
                      src={
                        assetUrl.startsWith("//")
                          ? `https:${assetUrl}`
                          : assetUrl
                      }
                    >
                      <source src={assetUrl} type={assetType} />
                      Your browser does not support the audio tag.
                    </audio>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">
                      File: {assetTitle} ({assetType})
                    </div>
                  )}
                </div>
              )}
              <EditableField
                label="Asset ID"
                name={`${field.id}-id`}
                value={value?.sys?.id || ""}
                onChange={(newId) =>
                  handleFieldUpdate(field.id, {
                    sys: {
                      type: "Link",
                      linkType: "Asset",
                      id: newId,
                    },
                  })
                }
                placeholder="Enter Contentful Asset ID"
              />
              <div className="text-sm text-muted-foreground mt-2">
                To update the {assetType?.split("/")[0] || "media"}, paste a
                Contentful Asset ID from your Media Library
              </div>
            </div>
          );
        } else if (field.validations?.find((v) => v.linkContentType)) {
          // Handle reference field (like author)
          const refId = value?.sys?.id;
          return (
            <EditableField
              key={field.id}
              label={field.name}
              name={field.id}
              value={refId || ""}
              onChange={(value) =>
                handleFieldUpdate(field.id, {
                  sys: {
                    type: "Link",
                    linkType: "Entry",
                    id: value,
                  },
                })
              }
              placeholder={`Enter ${field.name.toLowerCase()} ID`}
            />
          );
        }
        return null;
      case "Object":
        // Handle metadata or other complex objects
        return (
          <EditableField
            key={field.id}
            label={field.name}
            name={field.id}
            value={JSON.stringify(value, null, 2)}
            onChange={(value) => {
              try {
                handleFieldUpdate(field.id, JSON.parse(value));
              } catch (e) {
                handleFieldUpdate(field.id, value);
              }
            }}
            type="textarea"
            placeholder={`Enter ${field.name.toLowerCase()} as JSON`}
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
          />
        );
    }
  };

  const handleAIGenerate = (value: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(value, 'text/html');
    const content: any[] = [];

    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        switch (element.tagName.toLowerCase()) {
          case 'p':
            content.push({
              nodeType: 'paragraph',
              data: {},
              content: [{
                nodeType: 'text',
                value: element.textContent || '',
                marks: [],
                data: {}
              }]
            });
            break;
          case 'h1':
            content.push({
              nodeType: 'heading-1',
              data: {},
              content: [{
                nodeType: 'text',
                value: element.textContent || '',
                marks: [],
                data: {}
              }]
            });
            break;
          case 'h2':
            content.push({
              nodeType: 'heading-2',
              data: {},
              content: [{
                nodeType: 'text',
                value: element.textContent || '',
                marks: [],
                data: {}
              }]
            });
            break;
          case 'h3':
            content.push({
              nodeType: 'heading-3',
              data: {},
              content: [{
                nodeType: 'text',
                value: element.textContent || '',
                marks: [],
                data: {}
              }]
            });
            break;
          case 'ul':
            content.push({
              nodeType: 'unordered-list',
              data: {},
              content: Array.from(element.children).map(li => ({
                nodeType: 'list-item',
                data: {},
                content: [{
                  nodeType: 'paragraph',
                  data: {},
                  content: [{
                    nodeType: 'text',
                    value: li.textContent || '',
                    marks: [],
                    data: {}
                  }]
                }]
              }))
            });
            break;
          case 'ol':
            content.push({
              nodeType: 'ordered-list',
              data: {},
              content: Array.from(element.children).map(li => ({
                nodeType: 'list-item',
                data: {},
                content: [{
                  nodeType: 'paragraph',
                  data: {},
                  content: [{
                    nodeType: 'text',
                    value: li.textContent || '',
                    marks: [],
                    data: {}
                  }]
                }]
              }))
            });
            break;
        }
      }
    });

    const richTextContent = {
      nodeType: "document",
      data: {},
      content
    };

    handleFieldUpdate("content", richTextContent);
    setContentChanged(true);
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
                content: richTextToHtml(
                  pendingChanges.content ?? article.fields.content["en-US"]
                ),
                slug: pendingChanges.slug ?? article.fields.slug["en-US"],
              }}
            />

            <EditableField
              label="Subtitle"
              name="subtitle"
              value={
                pendingChanges.subtitle ??
                (article.fields.subtitle?.["en-US"] || "")
              }
              onChange={(value) => handleFieldUpdate("subtitle", value)}
              className="text-lg text-muted-foreground"
              context={{
                content: richTextToHtml(
                  pendingChanges.content ?? article.fields.content["en-US"]
                ),
                title: pendingChanges.title ?? article.fields.title["en-US"],
              }}
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="content" className="block text-sm font-medium">
                  Content
                </label>
                <AIFieldGenerator
                  fieldName="content"
                  currentValue={richTextToHtml(pendingChanges.content ?? article?.fields.content["en-US"])}
                  onGenerate={handleAIGenerate}
                  model={selectedModel}
                  context={{
                    title:
                      pendingChanges.title ?? article?.fields.title["en-US"],
                    subtitle:
                      pendingChanges.subtitle ??
                      article?.fields.subtitle?.["en-US"],
                    metaTitle:
                      pendingChanges.metaTitle ??
                      article?.fields.metaTitle?.["en-US"],
                    metaDescription:
                      pendingChanges.metaDescription ??
                      article?.fields.metaDescription?.["en-US"],
                    category:
                      pendingChanges.category ??
                      article?.fields.category?.["en-US"],
                    tags:
                      pendingChanges.tags ?? article?.fields.tags?.["en-US"],
                    content: richTextToHtml(
                      pendingChanges.content ?? article?.fields.content["en-US"]
                    ),
                  }}
                  customInstructions="Create a new article based on the context provided. You are both a writing expert and an SEO d expert. You are writing for a professional crypto exchange and non-custodial wallet provider, but you SHOULD NOT give investment advice or imply prices action. Avoid recommending specific products. 
                    You will write an informative and easy-to-understand article. We've already created an outline. The goal is to educate readers with varying levels of expertise, focusing on helping beginners to become more knowledgeable crypto enthusiasts. Use a clear, concise tone that balances technical details with practical explanations. The content should guide readers step-by-step when discussing actions they can take (e.g., how to trade, how to use a wallet) and provide real-world examples wherever possible.
                    Keep the language welcoming, avoid assuming prior knowledge, and anticipate common questions or concerns. The tone should be informative yet conversational, empowering readers to learn more about and participate in the crypto space.
                    Make sure the article is SEO optimized for most-likely crypto web search terms.
                    Write this article to have detailed prose, not just lists or a single sentance under headers. Use some consistent real-world analogies that would be familiar to the reader. Try to use the same or closely-related analogies throughout the article, so as not to mix too many concepts. Avoid fluff or weasle words, and don't pad the content just for length. Instead find relevant and meaty information to include, and do it according to the specified tone and voice guidance.
                    DO NOT include the title NOR subtitle in the response, we already have those. Keep the intro paragraph very short.
                    ENSURE the response is formatted with HTML tags: Use h2 for main sections, h3 for subsections, p for paragraphs, ul/li for lists.
                "
                />
              </div>
              {!isEditingContent ? (
                <div 
                  onClick={() => setIsEditingContent(true)}
                  className="relative cursor-text p-4 border rounded-md hover:border-primary/50 group min-h-[400px]"
                >
                  <div className="absolute inset-0 z-10 group-hover:bg-primary/5" />
                  <div className="relative z-20 prose prose-stone dark:prose-invert max-w-none">
                    <style jsx global>{`
                      h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
                      h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
                      h3 { font-size: 1.25em; font-weight: bold; margin-bottom: 0.5em; }
                      p { margin-bottom: 1em; }
                      ul { list-style-type: disc; padding-left: 2em; margin-bottom: 1em; }
                      ol { list-style-type: decimal; padding-left: 2em; margin-bottom: 1em; }
                      li { margin-bottom: 0.5em; }
                    `}</style>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: richTextToHtml(pendingChanges.content ?? article.fields.content["en-US"]) 
                      }} 
                    />
                  </div>
                </div>
              ) : (
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  value={richTextToHtml(pendingChanges.content ?? article.fields.content["en-US"])}
                  init={{
                    min_height: editorHeight,
                    height: "auto",
                    menubar: false,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "charmap",
                      "preview",
                      "searchreplace",
                      "visualblocks",
                      "code",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                      "help",
                      "wordcount",
                      "autoresize",
                    ],
                    toolbar: [
                      "undo redo | h1 h2 h3 | bullist numlist outdent indent |",
                      "removeformat | help",
                    ],
                    branding: false,
                    resize: true,
                    autoresize_bottom_margin: 0,
                    autoresize_min_height: editorHeight,
                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; }',
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
                  {Object.keys(pendingChanges).length > 0
                    ? `Publish ${Object.keys(pendingChanges).length} Changes`
                    : "No Changes"}
                </>
              )}
            </Button>

            {uploadStatus && (
              <div
                className={`mt-2 p-4 rounded-md transition-opacity duration-300 ease-in-out ${
                  uploadStatus.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <pre className="whitespace-pre-wrap text-sm">
                  {uploadStatus.message}
                </pre>
              </div>
            )}

            <div className="pt-4 border-t space-y-4">
              <h3 className="font-medium">Fields</h3>
              {contentType?.fields
                .filter((field) => field.type !== "RichText") // Skip rich text field as it's in main content
                .map((field) => renderField(field))}
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="font-medium">Model</h3>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="gpt-4">GPT-4</option>
                <option value="o1-mini">o1-mini</option>
                <option value="o1-preview">o1-preview</option>
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/contentful-space/${spaceId}`)
              }
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
