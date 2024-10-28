'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export function TextEditor() {
  const [selectedText, setSelectedText] = useState('');
  const debouncedSelection = useDebounce(selectedText, 100);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString() || '';
      setSelectedText(text);
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  useEffect(() => {
    if (debouncedSelection) {
      // Your popup logic here
      console.log('Debounced selection:', debouncedSelection);
    }
  }, [debouncedSelection]);

  return (
    // Your editor component
  );
}
