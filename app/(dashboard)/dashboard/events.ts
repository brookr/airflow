export const WEBFLOW_CONNECTION_ADDED = 'webflow-connection-added';
export const WEBFLOW_CONNECTION_REMOVED = 'webflow-connection-removed';

export const emitWebflowConnectionAdded = () => {
  window.dispatchEvent(new Event(WEBFLOW_CONNECTION_ADDED));
};

export const emitWebflowConnectionRemoved = () => {
  window.dispatchEvent(new Event(WEBFLOW_CONNECTION_REMOVED));
};
