"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ContentfulArticleList } from "./article-list";
import { ContentfulConnection } from "@/lib/db/schema";

export default function ContentfulSpacePage({
  params,
}: {
  params: { spaceId: string };
}) {
  const { user } = useUser();
  const router = useRouter();
  const [connection, setConnection] = useState<ContentfulConnection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.teamId) {
      router.push("/sign-in");
      return;
    }

    const fetchConnection = async () => {
      try {
        const response = await fetch(`/api/contentful/connections?teamId=${user.teamId}`);
        const data = await response.json();
        const foundConnection = data.connections.find(
          (c: ContentfulConnection) => c.spaceId === params.spaceId
        );

        if (!foundConnection) {
          router.push("/dashboard");
          return;
        }

        setConnection(foundConnection);
      } catch (error) {
        console.error("Failed to fetch connection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnection();
  }, [user?.teamId, params.spaceId, router]);

  if (loading) return <div>Loading...</div>;
  if (!connection) return null;

  return (
    <div className="flex-1 p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg lg:text-2xl font-medium">
          {connection.name} Articles
        </h1>
      </div>
      <ContentfulArticleList spaceId={params.spaceId} />
    </div>
  );
} 
