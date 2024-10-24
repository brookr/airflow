'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@/lib/auth';

type Collection = {
  collectionId: string;
  collectionName: string;
};

export default function WebflowCollectionsPage() {
  const { user } = useUser();
  const teamId = user?.teamId;
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;

    const fetchCollections = async () => {
      try {
        const response = await fetch(`/api/webflow/connections?teamId=${teamId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch collections.');
        }
        const data = await response.json();
        setCollections(data.connections);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, [teamId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Webflow Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {collections.map((collection) => (
              <li key={collection.collectionId} className="mb-2">
                <Link href={`/dashboard/webflow-collection/${collection.collectionId}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    {collection.collectionId}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
