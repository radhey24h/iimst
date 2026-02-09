'use client';

import { useEffect } from 'react';

export default function ScrollToHash() {
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash?.slice(1) : '';
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);
  return null;
}
