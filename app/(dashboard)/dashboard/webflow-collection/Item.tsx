import React from 'react';

type CollectionItem = {
  _id: string;
  fieldData: {
    name: string;
  };
  createdOn: string;
  isDraft: boolean;
};

export default function Item({ item }: { item: CollectionItem }) {
  return (
    <tr>
      <td className="border px-4 py-2">{item.fieldData.name}</td>
      <td className="border px-4 py-2">{new Date(item.createdOn).toLocaleDateString()}</td>
      <td className="border px-4 py-2">{item.isDraft ? 'Draft' : 'Published'}</td>
    </tr>
  );
}
