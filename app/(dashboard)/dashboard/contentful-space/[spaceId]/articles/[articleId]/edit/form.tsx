"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      "en-US": string;
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

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(
          `/api/contentful/spaces/${spaceId}/articles/${articleId}`
        );
        const data = await response.json();
        setTitle(data.fields.title["en-US"]);
        setSlug(data.fields.slug["en-US"]);
        setContent(data.fields.content["en-US"]);
      } catch (error) {
        console.error("Failed to fetch article:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [spaceId, articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const articleData: ArticleData = {
      fields: {
        title: { "en-US": title },
        slug: { "en-US": slug },
        content: { "en-US": content },
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
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Article content..."
              required
              className="min-h-[200px]"
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
