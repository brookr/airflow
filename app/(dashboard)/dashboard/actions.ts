'use client';

import { emitWebflowConnectionAdded, emitWebflowConnectionRemoved } from './events';

export const addWebflowConnectionAction = async (data: { teamId: number; webflowToken: string; collectionId: string; name: string }) => {
  const response = await fetch('/api/webflow/connections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (response.ok) {
    emitWebflowConnectionAdded();
  }
  
  return result;
};

export const removeWebflowConnectionAction = async (connectionId: number) => {
  const response = await fetch(`/api/webflow/connections/${connectionId}`, {
    method: 'DELETE',
  });
  
  const result = await response.json();
  
  if (response.ok) {
    emitWebflowConnectionRemoved();
  }
  
  return result;
};
