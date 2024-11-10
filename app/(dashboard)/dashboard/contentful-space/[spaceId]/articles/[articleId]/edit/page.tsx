"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableField } from "@/components/ui/editable-field";
import { Rocket } from "lucide-react";
import { ContentfulConnection } from "@/lib/db/schema";

interface ContentField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  localized: boolean;
}

interface ContentType {
  sys: {
    id: string;
  };
  name: string;
  fields: ContentField[];
}

interface ArticleData {
  sys: {
    id: string;
    version: number;
  };
  fields: Record<string, Record<string, any>>;
}

export default function EditArticlePage({
  params,
}: {
  params: { spaceId: string; articleId: string };
}) {
  const { user } = useUser();
  const router = useRouter();
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isStatusVisible, setIsStatusVisible] = useState(true);

  useEffect(() => {
    if (!user?.teamId) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch connection
        const connResponse = await fetch(`/api/contentful/connections?teamId=${user.teamId}`);
        const connData = await connResponse.json();
        const connection = connData.connections.find(
          (c: ContentfulConnection) => c.spaceId === params.spaceId
        );

        if (!connection) {
          router.push("/dashboard");
          return;
        }

        // Fetch content type
        const contentTypeResponse = await fetch(
          `/api/contentful/spaces/${params.spaceId}/content-types`
        );
        const contentTypeData = await contentTypeResponse.json();
        setContentType(contentTypeData.contentType);

        // Fetch article
        const articleResponse = await fetch(
          `/api/contentful/spaces/${params.spaceId}/articles/${params.articleId}`
        );
        const articleData = await articleResponse.json();
        setArticle(articleData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [user?.teamId, params.spaceId, params.articleId, router]);

  const handleFieldUpdate = async (fieldId: string, value: any) => {
    if (!article) return;

    try {
      const updatedArticle = {
        ...article,
        fields: {
          ...article.fields,
          [fieldId]: { "en-US": value }
        }
      };

      const response = await fetch(
        `/api/contentful/spaces/${params.spaceId}/articles/${params.articleId}`,
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
        throw new Error('Failed to update article');
      }

      const newArticle = await response.json();
      setArticle(newArticle);
      setUploadStatus({
        type: 'success',
        message: `Updated ${fieldId}`
      });
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Failed to update ${fieldId}`
      });
    }
  };

  if (!contentType || !article) return <div>Loading...</div>;

  return (
    <div className="flex-1 p-4 lg:p-8 w-full">
      <form className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {contentType.fields.map((field) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <EditableField
                  label={field.name}
                  name={`fields.${field.id}`}
                  value={article.fields[field.id]?.["en-US"] || ""}
                  onChange={(value) => handleFieldUpdate(field.id, value)}
                  type={field.type === 'Text' ? 'textarea' : 'text'}
                  required={field.required}
                  context={{
                    contentType: contentType.name,
                    fieldType: field.type,
                    localized: field.localized,
                    ...article.fields
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <aside className="w-full lg:w-80 space-y-4 bg-muted/10 p-4 rounded-lg">
          <Button
            type="button"
            onClick={() => router.push(`/dashboard/contentful-space/${params.spaceId}`)}
            className="w-full flex items-center justify-center"
          >
            <Rocket className="mr-2 h-4 w-4" />
            Back to Articles
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
        </aside>
      </form>
    </div>
  );
} 
