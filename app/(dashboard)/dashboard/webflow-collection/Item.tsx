import React from 'react';
import { Edit } from 'lucide-react';

type CollectionItem = {
  _id: string;
  fieldData: {
    name: string;
  };
  createdOn: string;
  isDraft: boolean;
};

export default function Item({ item, collectionId }: { item: CollectionItem; collectionId: string }) {
  return (
    <>
      <td className="border px-4 py-2 flex justify-between items-center">
        {item.fieldData.name}
        <a href={`/dashboard/webflow-collection/${collectionId}/items/${item._id}/edit`} className="opacity-0 group-hover:opacity-90">
          <Edit />
        </a>
      </td>
      <td className="border px-4 py-2">{new Date(item.createdOn).toLocaleDateString()}</td>
      <td className="border px-4 py-2">{item.isDraft ? 'Draft' : 'Published'}</td>
    </>
  );
}
