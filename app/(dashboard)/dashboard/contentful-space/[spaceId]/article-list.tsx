"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

interface Article {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    title: {
      "en-US": string;
    };
    slug: {
      "en-US": string;
    };
  };
}

export function ContentfulArticleList({ spaceId }: { spaceId: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`/api/contentful/spaces/${spaceId}/articles`);
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        setError(error instanceof Error ? error.message : 'Failed to fetch articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [spaceId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading articles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/dashboard/contentful-space/${spaceId}/articles/new`}>
            Create Article
          </Link>
        </Button>
      </div>
      
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/10 rounded-lg">
          <p className="text-muted-foreground mb-4">No articles found</p>
          <Button asChild>
            <Link href={`/dashboard/contentful-space/${spaceId}/articles/new`}>
              Create Your First Article
            </Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.sys.id}>
                <TableCell>{article.fields.title["en-US"]}</TableCell>
                <TableCell>{article.fields.slug["en-US"]}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(article.sys.updatedAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    asChild
                    className="hover:bg-transparent p-0"
                  >
                    <Link
                      href={`/dashboard/contentful-space/${spaceId}/articles/${article.sys.id}/edit`}
                    >
                      Edit
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 
