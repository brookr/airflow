"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Rocket } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { EditableField } from "@/components/ui/editable-field";
import * as RadioGroup from "@radix-ui/react-radio-group";

type CollectionItem = {
  id: string;
  fieldData: {
    "is-this-a-featured-article": boolean;
    "is-this-a-trending-article": boolean;
    "should-i-be-on-the-home-page": boolean;
    name: string;
    content: string;
    "meta-title-seo": string;
    "meta-description-seo": string;
    subtitle: string;
    "preview-image": {
      fileId: string;
      url: string;
      alt: string | null;
    };
    slug: string;
    "choose-category": string;
    "related-posts": string[];
    "tags-2": string;
  };
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
};

export default function EditWebflowItemPage() {
  const { collectionId, itemId } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<CollectionItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CollectionItem["fieldData"]>({
    "is-this-a-featured-article": false,
    "is-this-a-trending-article": false,
    "should-i-be-on-the-home-page": false,
    name: "",
    content: "",
    "meta-title-seo": "",
    "meta-description-seo": "",
    subtitle: "",
    "preview-image": {
      fileId: "",
      url: "",
      alt: null,
    },
    slug: "",
    "choose-category": "",
    "related-posts": [],
    "tags-2": "",
  });
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [contentChanged, setContentChanged] = useState(false);
  const [editorHeight, setEditorHeight] = useState<number>(600);
  const contentPreviewRef = useRef<HTMLDivElement>(null);
  const [recentInstructions, setRecentInstructions] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  // Add a new state for fade control
  const [isStatusVisible, setIsStatusVisible] = useState(true);

  // Add this useEffect to handle auto-dismissal
  useEffect(() => {
    if (uploadStatus?.type === 'success') {
      setIsStatusVisible(true); // Show immediately
      const fadeTimer = setTimeout(() => {
        setIsStatusVisible(false); // Start fade out
      }, 2700); // Start fade slightly before removal

      const removeTimer = setTimeout(() => {
        setUploadStatus(null); // Remove after fade completes
      }, 3000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [uploadStatus]);

  // Move the fetch into a separate function
  const fetchItemData = async () => {
    try {
      const response = await fetch(
        `/api/webflow/collections/${collectionId}/items/${itemId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch the item.");
      }
      const data: CollectionItem = await response.json();
      setItem(data);
      // Ensure all fields are defined in formData
      setFormData({
        "is-this-a-featured-article": data.fieldData["is-this-a-featured-article"] ?? false,
        "is-this-a-trending-article": data.fieldData["is-this-a-trending-article"] ?? false,
        "should-i-be-on-the-home-page": data.fieldData["should-i-be-on-the-home-page"] ?? false,
        name: data.fieldData.name ?? "",
        content: data.fieldData.content ?? "",
        "meta-title-seo": data.fieldData["meta-title-seo"] ?? "",
        "meta-description-seo": data.fieldData["meta-description-seo"] ?? "",
        subtitle: data.fieldData.subtitle ?? "",
        "preview-image": {
          fileId: data.fieldData["preview-image"]?.fileId ?? "",
          url: data.fieldData["preview-image"]?.url ?? "",
          alt: data.fieldData["preview-image"]?.alt ?? null,
        },
        slug: data.fieldData.slug ?? "",
        "choose-category": data.fieldData["choose-category"] ?? "",
        "related-posts": data.fieldData["related-posts"] ?? [],
        "tags-2": data.fieldData["tags-2"] ?? "",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!collectionId || !itemId) return;
    fetchItemData();
  }, [collectionId, itemId]);

  useEffect(() => {
    if (contentPreviewRef.current && !isEditingContent) {
      const height = contentPreviewRef.current.offsetHeight;
      setEditorHeight(Math.max(height, 600)); 
    }
  }, [formData.content, isEditingContent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = type === 'checkbox' ? target.checked : undefined;

    if (name.startsWith("fieldData.")) {
      const fieldName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        [fieldName]:
          type === "checkbox"
            ? checked
            : fieldName === "related-posts"
            ? value.split(",").map((s) => s.trim())
            : value,
      }));
    }
  };

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadStatus(null);

    try {
      const response = await fetch(
        `/api/webflow/collections/${collectionId}/items/${itemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update the item.");
      }

      const data = await response.json();
      setUploadStatus({
        type: 'success',
        message: 'Article updated successfully'
      });
      setContentChanged(false);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setUploadStatus({
        type: 'error',
        message
      });
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!item) return <div>Item not found.</div>;

  return (
    <div className="flex-1 p-4 lg:p-8 w-full">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <EditableField
              label="Title"
              name="fieldData.name"
              value={formData.name}
              onChange={(value) => 
                setFormData(prev => ({
                  ...prev,
                  name: value
                }))
              }
              className="text-2xl font-bold"
              context={{
                content: formData.content,
                subtitle: formData.subtitle,
                metaTitle: formData["meta-title-seo"],
                metaDescription: formData["meta-description-seo"],
                category: formData["choose-category"],
                tags: formData["tags-2"]
              }}
            />

            <EditableField
              label="Subtitle"
              name="fieldData.subtitle"
              value={formData.subtitle}
              onChange={(value) => 
                setFormData(prev => ({
                  ...prev,
                  subtitle: value
                }))
              }
              className="text-lg text-muted-foreground"
              context={{
                content: formData.content,
                title: formData.name,
                metaTitle: formData["meta-title-seo"],
                metaDescription: formData["meta-description-seo"],
                category: formData["choose-category"],
                tags: formData["tags-2"]
              }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium">Content</label>
            {!isEditingContent ? (
              <div 
                ref={contentPreviewRef}
                onClick={() => setIsEditingContent(true)}
                className="relative cursor-text p-4 border rounded-md hover:border-primary/50 group"
              >
                <div className="absolute inset-0 z-10 group-hover:bg-primary/5" />
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <style>
                          body { 
                            margin: 0; 
                            font-family: system-ui, sans-serif;
                            height: auto !important;
                          }
                          ul { list-style-type: disc; padding-left: 2em; }
                          ol { list-style-type: decimal; padding-left: 2em; }
                          h1 { font-size: 2em; margin-bottom: 0.5em; }
                          h2 { font-size: 1.5em; margin-bottom: 0.5em; }
                          h3 { font-size: 1.25em; margin-bottom: 0.5em; }
                          p { margin-bottom: 1em; }
                          a { color: #0066cc; text-decoration: none; }
                          a:hover { text-decoration: underline; }
                        </style>
                      </head>
                      <body>${formData.content}</body>
                    </html>
                  `}
                  className="w-full border-none pointer-events-none"
                  style={{ minHeight: '100px' }}
                  onLoad={(e) => {
                    const iframe = e.target as HTMLIFrameElement;
                    if (iframe.contentWindow) {
                      const height = iframe.contentWindow.document.documentElement.scrollHeight;
                      iframe.style.height = `${height}px`;
                      setEditorHeight(height); // Set the editor height to match
                    }
                  }}
                />
              </div>
            ) : (
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={formData.content}
                init={{
                  min_height: editorHeight,
                  height: 'auto',
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount', 'autoresize'
                  ].join(' '),
                  toolbar: 'undo redo | formatselect | bold italic backcolor | bullist numlist outdent indent | removeformat | help',
                  block_formats: 'Paragraph=p;Heading 1=h1;Heading 2=h2;Heading 3=h3;',
                  branding: false,
                  sticky: true,
                  sticky_offset: 0,
                  toolbar_sticky: true,
                  toolbar_sticky_offset: 64,
                  resize: true,
                  autoresize_bottom_margin: 0,
                  autoresize_min_height: editorHeight,
                  send_usage_data: false,
                  extended_valid_elements: 'span[style|class]',  // Allow span elements with style attributes
                  valid_styles: {
                    '*': 'background-color,opacity,transition'    // Allow these CSS properties on all elements
                  },
                  content_style: `
                    .loading-fade {
                      background-color: #fef9c3;
                      opacity: 0.5;
                      transition: opacity 2s ease-in-out;
                    }
                  `,  // Define the style as a class
                  setup: (editor) => {
                    // Register the action buttons
                    editor.ui.registry.addButton('regenerate', {
                      icon: 'reload',
                      tooltip: 'Regenerate',
                      onAction: () => handleAIAction('regenerate', '')
                    });

                    editor.ui.registry.addButton('expound', {
                      icon: 'plus',
                      tooltip: 'Expound',
                      onAction: () => handleAIAction('expound', '')
                    });

                    editor.ui.registry.addButton('condense', {
                      icon: 'minus',
                      tooltip: 'Condense',
                      onAction: () => handleAIAction('condense', '')
                    });

                    // Modified split button for instructions with history
                    editor.ui.registry.addSplitButton('custominstruction', {
                      icon: 'ai-prompt',
                      tooltip: 'Custom Instructions',
                      onAction: () => {
                        const instructions = window.prompt('Enter custom instructions:');
                        if (instructions) {
                          // Add to recent instructions
                          setRecentInstructions(prev => {
                            const newHistory = [instructions, ...prev.slice(0, 4)];
                            return [...new Set(newHistory)]; // Remove duplicates
                          });
                          handleAIAction('regenerate', instructions);
                        }
                      },
                      onItemAction: (api, value) => {
                        handleAIAction('regenerate', value);
                      },
                      fetch: (callback) => {
                        const items = recentInstructions.map(instruction => ({
                          type: 'choiceitem' as const,
                          text: instruction.length > 40 ? instruction.slice(0, 37) + '...' : instruction,
                          value: instruction
                        }));
                        
                        if (items.length === 0) {
                          items.push({
                            type: 'choiceitem' as const,
                            text: 'No recent instructions',
                            value: ''
                          });
                        }
                        
                        callback(items);
                      }
                    });

                    // Add the context toolbar
                    editor.ui.registry.addContextToolbar('aiActions', {
                      predicate: (node) => {
                        const selection = editor.selection.getContent({ format: 'text' });
                        return !!selection;
                      },
                      items: 'regenerate expound condense custominstruction',
                      position: 'selection'
                    });

                    const handleAIAction = async (action: 'regenerate' | 'expound' | 'condense', instructions: string = '') => {
                      const selectedText = editor.selection.getContent({ format: 'text' });
                      if (!selectedText) return;

                      const fullContent = editor.getContent({ format: 'text' });
                      const bookmarkId = editor.selection.getBookmark();
                      
                      try {
                        editor.selection.setContent(
                          `<span style="background-color: #fef9c3; opacity: 0.5;">${selectedText}</span>`
                        );
                        
                        const response = await fetch('/api/ai', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            action,
                            selectedText,
                            fullArticle: fullContent,
                            metadata: {
                              title: formData.name,
                              subtitle: formData.subtitle,
                              metaTitle: formData["meta-title-seo"],
                              metaDescription: formData["meta-description-seo"],
                              category: formData["choose-category"],
                              tags: formData["tags-2"],
                              instructions
                            }
                          }),
                        });

                        if (!response.ok) throw new Error(`Failed to ${action} content`);
                        
                        const data = await response.json();
                        editor.selection.moveToBookmark(bookmarkId);
                        editor.selection.setContent(data.replacementText);
                        setContentChanged(true);
                        
                      } catch (error) {
                        console.error(`${action} failed:`, error);
                        editor.selection.moveToBookmark(bookmarkId);
                        editor.selection.setContent(selectedText);
                      }
                    };
                  }
                }}
                onEditorChange={(content) => {
                  handleEditorChange(content);
                  setContentChanged(true);
                }}
                onBlur={() => setIsEditingContent(false)}
              />
            )}
            {contentChanged && (
              <div className="absolute -top-2 -right-2 h-4 w-4 bg-yellow-400 rounded-full" />
            )}
          </div>
        </div>

        <aside className="w-full lg:w-80 space-y-4 bg-muted/10 p-4 rounded-lg">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Status</h3>
              <div className="rounded-lg border p-2">
                <RadioGroup.Root
                  value={item?.isDraft ? "draft" : "published"}
                  onValueChange={async (value) => {
                    const isDraft = value === "draft";
                    try {
                      const response = await fetch(
                        `/api/webflow/collections/${collectionId}/items/${itemId}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            ...formData,
                            isDraft
                          }),
                        }
                      );
                      
                      if (!response.ok) throw new Error("Failed to update status");
                      const updatedItem = await response.json();
                      setItem(prev => prev ? { ...prev, isDraft } : null);
                      
                      setUploadStatus({
                        type: 'success',
                        message: `Article ${isDraft ? 'set to draft' : 'published'}`
                      });
                    } catch (err) {
                      setUploadStatus({
                        type: 'error',
                        message: 'Failed to update status'
                      });
                    }
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center">
                    <RadioGroup.Item
                      value="published"
                      id="published"
                      className="w-4 h-4 rounded-full border border-primary mr-2 data-[state=checked]:bg-primary"
                    >
                      <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-white" />
                    </RadioGroup.Item>
                    <label htmlFor="published" className="text-sm">Published</label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroup.Item
                      value="draft"
                      id="draft"
                      className="w-4 h-4 rounded-full border border-primary mr-2 data-[state=checked]:bg-primary"
                    >
                      <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-white" />
                    </RadioGroup.Item>
                    <label htmlFor="draft" className="text-sm">Draft</label>
                  </div>
                </RadioGroup.Root>
                <p className="text-xs text-muted-foreground mt-2">
                  Changes take effect immediately
                </p>
              </div>
            </div>

            {/* SEO Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">SEO</h3>
              <EditableField
                label="Meta Title"
                name="fieldData.meta-title-seo"
                value={formData["meta-title-seo"]}
                onChange={(value) => 
                  setFormData(prev => ({
                    ...prev,
                    "meta-title-seo": value
                  }))
                }
                context={{
                  content: formData.content,
                  title: formData.name,
                  subtitle: formData.subtitle,
                  metaDescription: formData["meta-description-seo"],
                  category: formData["choose-category"],
                  tags: formData["tags-2"]
                }}
              />

              <EditableField
                label="Meta Description"
                name="fieldData.meta-description-seo"
                value={formData["meta-description-seo"]}
                onChange={(value) => 
                  setFormData(prev => ({
                    ...prev,
                    "meta-description-seo": value
                  }))
                }
                type="textarea"
                context={{
                  content: formData.content,
                  title: formData.name,
                  subtitle: formData.subtitle,
                  metaTitle: formData["meta-title-seo"],
                  category: formData["choose-category"],
                  tags: formData["tags-2"]
                }}
              />
            </div>

            {/* Article Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Article Details</h3>
              <EditableField
                label="Slug"
                name="fieldData.slug"
                value={formData.slug}
                onChange={(value) => 
                  setFormData(prev => ({
                    ...prev,
                    slug: value
                  }))
                }
                context={{
                  content: formData.content,
                  title: formData.name,
                  subtitle: formData.subtitle,
                  metaTitle: formData["meta-title-seo"],
                  metaDescription: formData["meta-description-seo"],
                  category: formData["choose-category"],
                  tags: formData["tags-2"]
                }}
              />

              <EditableField
                label="Category"
                name="fieldData.choose-category"
                value={formData["choose-category"]}
                onChange={(value) => 
                  setFormData(prev => ({
                    ...prev,
                    "choose-category": value
                  }))
                }
              />

              <EditableField
                label="Tags"
                name="fieldData.tags-2"
                value={formData["tags-2"]}
                onChange={(value) => 
                  setFormData(prev => ({
                    ...prev,
                    "tags-2": value
                  }))
                }
                type="textarea"
              />

              <EditableField
                label="Related Posts"
                name="fieldData.related-posts"
                value={formData["related-posts"].join(", ")}
                onChange={(value) => 
                  setFormData(prev => ({
                    ...prev,
                    "related-posts": value.split(",").map(s => s.trim())
                  }))
                }
                type="textarea"
                placeholder="Enter post IDs separated by commas"
              />
            </div>

            {/* Preview Image */}
            <div className="space-y-4">
              <h3 className="font-semibold">Preview Image</h3>
              {formData["preview-image"]?.url && (
                <div className="relative w-full aspect-video mb-4 bg-muted/30 rounded-lg overflow-hidden">
                  <img
                    src={formData["preview-image"].url}
                    alt={formData["preview-image"]?.alt || "Preview"}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <EditableField
                label="Image URL"
                name="fieldData.preview-image.url"
                value={formData["preview-image"]?.url || ""}
                onChange={(value) => 
                  setFormData(prev => ({
                    ...prev,
                    "preview-image": {
                      ...prev["preview-image"],
                      url: value
                    }
                  }))
                }
              />

              <EditableField
                label="File ID"
                name="fieldData.preview-image.fileId"
                value={formData["preview-image"]?.fileId || ""}
                onChange={(value) => 
                  setFormData(prev => ({
                    ...prev,
                    "preview-image": {
                      ...prev["preview-image"],
                      fileId: value
                    }
                  }))
                }
              />

              <EditableField
                label="Alt Text"
                name="fieldData.preview-image.alt"
                value={formData["preview-image"]?.alt || ""}
                onChange={(value) => 
                  setFormData(prev => ({
                    ...prev,
                    "preview-image": {
                      ...prev["preview-image"],
                      alt: value
                    }
                  }))
                }
              />
            </div>

            {/* Visibility Settings */}
            <div className="space-y-2">
              <h3 className="font-semibold">Visibility</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is-this-a-featured-article"
                  name="fieldData.is-this-a-featured-article"
                  checked={formData["is-this-a-featured-article"]}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary border-border rounded"
                />
                <label htmlFor="is-this-a-featured-article" className="ml-2 text-sm">Featured Article</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is-this-a-trending-article"
                  name="fieldData.is-this-a-trending-article"
                  checked={formData["is-this-a-trending-article"]}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary border-border rounded"
                />
                <label htmlFor="is-this-a-trending-article" className="ml-2 text-sm">Trending Article</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="should-i-be-on-the-home-page"
                  name="fieldData.should-i-be-on-the-home-page"
                  checked={formData["should-i-be-on-the-home-page"]}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary border-border rounded"
                />
                <label htmlFor="should-i-be-on-the-home-page" className="ml-2 text-sm">Show on Homepage</label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className={`w-full flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors
                ${isUploading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-primary/90'}`}
            >
              {isUploading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Uploading...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Upload Article
                </>
              )}
            </button>

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
          </div>
        </aside>
      </form>
    </div>
  );
}
