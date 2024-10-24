"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Edit } from "lucide-react";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

type CollectionItem = {
  _id: string;
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
  const [formData, setFormData] = useState<CollectionItem['fieldData']>({
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

  useEffect(() => {
    if (!collectionId || !itemId) return;

    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/webflow/collections/${collectionId}/items/${itemId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch the item.");
        }
        const data: CollectionItem = await response.json();
        setItem(data);
        setFormData(data.fieldData);
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

    fetchItem();
  }, [collectionId, itemId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/webflow/collections/${collectionId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to update the item.");
      }
      router.push(`/dashboard/webflow-collection/${collectionId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!item) return <p>Item not found.</p>;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="fieldData.name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium">
            Content
          </label>
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
            className="mt-1 p-2 border w-full h-40"
          />
        </div>

        <div>
          <label htmlFor="meta-title-seo" className="block text-sm font-medium">
            Meta Title SEO
          </label>
          <input
            type="text"
            id="meta-title-seo"
            name="fieldData.meta-title-seo"
            value={formData["meta-title-seo"]}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
          />
        </div>

        <div>
          <label htmlFor="meta-description-seo" className="block text-sm font-medium">
            Meta Description SEO
          </label>
          <input
            type="text"
            id="meta-description-seo"
            name="fieldData.meta-description-seo"
            value={formData["meta-description-seo"]}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
          />
        </div>

        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium">
            Subtitle
          </label>
          <input
            type="text"
            id="subtitle"
            name="fieldData.subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium">
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="fieldData.slug"
            value={formData.slug}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
          />
        </div>

        <div>
          <label htmlFor="choose-category" className="block text-sm font-medium">
            Choose Category
          </label>
          <input
            type="text"
            id="choose-category"
            name="fieldData.choose-category"
            value={formData["choose-category"]}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
          />
        </div>

        <div>
          <label htmlFor="related-posts" className="block text-sm font-medium">
            Related Posts (comma-separated IDs)
          </label>
          <input
            type="text"
            id="related-posts"
            name="fieldData.related-posts"
            value={formData["related-posts"].join(", ")}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
          />
        </div>

        <div>
          <label htmlFor="tags-2" className="block text-sm font-medium">
            Tags
          </label>
          <input
            type="text"
            id="tags-2"
            name="fieldData.tags-2"
            value={formData["tags-2"]}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is-this-a-featured-article"
            name="fieldData.is-this-a-featured-article"
            checked={formData["is-this-a-featured-article"]}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="is-this-a-featured-article" className="ml-2 block text-sm">
            Is this a featured article?
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is-this-a-trending-article"
            name="fieldData.is-this-a-trending-article"
            checked={formData["is-this-a-trending-article"]}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="is-this-a-trending-article" className="ml-2 block text-sm">
            Is this a trending article?
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="should-i-be-on-the-home-page"
            name="fieldData.should-i-be-on-the-home-page"
            checked={formData["should-i-be-on-the-home-page"]}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="should-i-be-on-the-home-page" className="ml-2 block text-sm">
            Should this be on the home page?
          </label>
        </div>

        <div>
          <label htmlFor="preview-image-fileId" className="block text-sm font-medium">
            Preview Image File ID
          </label>
          <input
            type="text"
            id="preview-image-fileId"
            name="fieldData.preview-image.fileId"
            value={formData["preview-image"].fileId}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
          />
        </div>

        <div>
          <label htmlFor="preview-image-url" className="block text-sm font-medium">
            Preview Image URL
          </label>
          <input
            type="text"
            id="preview-image-url"
            name="fieldData.preview-image.url"
            value={formData["preview-image"].url}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
          />
        </div>

        <div>
          <label htmlFor="preview-image-alt" className="block text-sm font-medium">
            Preview Image Alt Text
          </label>
          <input
            type="text"
            id="preview-image-alt"
            name="fieldData.preview-image.alt"
            value={formData["preview-image"].alt || ""}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
          />
        </div>

        <button type="submit" className="flex items-center px-4 py-2 bg-blue-600 text-white">
          <Edit className="mr-2" />
          Update Item
        </button>
      </form>
    </section>
  );
}
