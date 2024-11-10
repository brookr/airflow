"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentfulConnection } from "@/lib/db/schema";
import { Edit } from "lucide-react";

type Article = {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields?: {
    title?: {
      "en-US": string;
    };
    slug?: {
      "en-US": string;
    };
  };
};

export default function ContentfulSpacePage() {
  const { spaceId } = useParams();
  const { user } = useUser();
  const router = useRouter();

  const [connection, setConnection] = useState<ContentfulConnection | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [filterDraft, setFilterDraft] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.teamId || !spaceId) return;

    const fetchData = async () => {
      try {
        // Fetch connection
        const connResponse = await fetch(`/api/contentful/connections?teamId=${user.teamId}`);
        const connData = await connResponse.json();
        const foundConnection = connData.connections.find(
          (c: ContentfulConnection) => c.spaceId === spaceId
        );

        if (!foundConnection) {
          router.push("/dashboard");
          return;
        }

        setConnection(foundConnection);

        // Fetch articles
        const articlesResponse = await fetch(`/api/contentful/spaces/${spaceId}/articles`);
        if (!articlesResponse.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await articlesResponse.json();
        setArticles(data.articles || []);
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

    fetchData();
  }, [user?.teamId, spaceId, router]);

  useEffect(() => {
    const result = articles
      ? articles
          .filter((article) => {
            if (filterDraft === "") return true;
            // In Contentful, we can check if the article has been published
            return article.sys.updatedAt === article.sys.createdAt === (filterDraft === "true");
          })
          .sort((a, b) => {
            if (sortOrder === "asc")
              return (
                new Date(a.sys.createdAt).getTime() -
                new Date(b.sys.createdAt).getTime()
              );
            return (
              new Date(b.sys.createdAt).getTime() - new Date(a.sys.createdAt).getTime()
            );
          })
      : [];
    setFilteredArticles(result);
  }, [articles, filterDraft, sortOrder]);

  const handleCreateNew = async () => {
    try {
      const response = await fetch(`/api/contentful/spaces/${spaceId}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            title: { "en-US": "New Article" },
            slug: { "en-US": "new-article" },
            content: { "en-US": "" }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create new article');
      }

      const newArticle = await response.json();
      router.push(`/dashboard/contentful-space/${spaceId}/articles/${newArticle.sys.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!connection) return null;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contentful Articles</CardTitle>
          <Button onClick={handleCreateNew}>+</Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between">
            <select
              value={filterDraft}
              onChange={(e) => setFilterDraft(e.target.value)}
              className="border p-2"
            >
              <option value="">All</option>
              <option value="true">Drafts</option>
              <option value="false">Published</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="border p-2"
            >
              Sort by Date {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
          {filteredArticles?.length > 0 ? (
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Title</th>
                  <th className="border px-4 py-2">Created On</th>
                  <th className="border px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article.sys.id} className="group">
                    <td className="border px-4 py-2">
                      <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent flex items-center w-full justify-between"
                        onClick={() => router.push(`/dashboard/contentful-space/${spaceId}/articles/${article.sys.id}/edit`)}
                      >
                        <span>{article.fields?.title?.["en-US"] || "Untitled"}</span>
                        <Edit 
                          className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                        />
                      </Button>
                    </td>
                    <td className="border px-4 py-2">
                      {new Date(article.sys.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border px-4 py-2">
                      {article.sys.updatedAt === article.sys.createdAt ? "Draft" : "Published"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No articles found in this space.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
