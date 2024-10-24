export const addWebflowConnectionAction = async (data: { teamId: number; webflowToken: string; collectionId: string }) => {
  const response = await fetch('/api/webflow/connections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
};

export const removeWebflowConnectionAction = async (connectionId: number) => {
  const response = await fetch(`/api/webflow/connections/${connectionId}`, {
    method: 'DELETE',
  });
  
  return response.json();
};
