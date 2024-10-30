"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import Item from "../Item";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type CollectionItem = {
  id: string;
  fieldData: {
    name: string;
  };
  createdOn: string;
  isDraft: boolean;
};

export default function WebflowCollectionPage() {
  const { collectionId } = useParams();
  const { user } = useUser();
  const router = useRouter();

  const [items, setItems] = useState<CollectionItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CollectionItem[]>([]);
  const [filterDraft, setFilterDraft] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionId) return;

    const fetchItems = async () => {
      console.log("fetching for collectionId", collectionId);
      try {
        const response = await fetch(
          `/api/webflow/collections/${collectionId}/items`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch any collection items.");
        }
        const data = await response.json();
        setItems(data);
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
    fetchItems();
  }, [collectionId]);

  useEffect(() => {
    console.log("updating filtered items:", items);
    const result = items
      ? items
          .filter((item) => {
            if (filterDraft === "") return true;
            return item.isDraft === (filterDraft === "true");
          })
          .sort((a, b) => {
            if (sortOrder === "asc")
              return (
                new Date(a.createdOn).getTime() -
                new Date(b.createdOn).getTime()
              );
            return (
              new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
            );
          })
      : [];
    setFilteredItems(result);
  }, [items, filterDraft, sortOrder]);

  const handleCreateNew = async () => {
    try {
      const response = await fetch(`/api/webflow/collections/${collectionId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fieldData: {
            name: 'New Article'
          },
          isDraft: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create new article');
      }

      const newItem = await response.json();
      router.push(`/dashboard/webflow-collection/${collectionId}/items/${newItem.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Webflow Collection Items</CardTitle>
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
          {filteredItems?.length > 0 ? (
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Created On</th>
                  <th className="border px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="group">
                    <Item item={item} collectionId={collectionId as string} />
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No items found in this collection.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
