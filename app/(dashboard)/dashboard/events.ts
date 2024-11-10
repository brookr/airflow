export const WEBFLOW_CONNECTION_ADDED = 'webflow-connection-added';
export const WEBFLOW_CONNECTION_REMOVED = 'webflow-connection-removed';
export const CONTENTFUL_CONNECTION_ADDED = 'contentful-connection-added';
export const CONTENTFUL_CONNECTION_REMOVED = 'contentful-connection-removed';

export const emitWebflowConnectionAdded = () => {
  window.dispatchEvent(new Event(WEBFLOW_CONNECTION_ADDED));
};

export const emitWebflowConnectionRemoved = () => {
  window.dispatchEvent(new Event(WEBFLOW_CONNECTION_REMOVED));
};

export const emitContentfulConnectionAdded = () => {
  window.dispatchEvent(new Event(CONTENTFUL_CONNECTION_ADDED));
};

export const emitContentfulConnectionRemoved = () => {
  window.dispatchEvent(new Event(CONTENTFUL_CONNECTION_REMOVED));
};
