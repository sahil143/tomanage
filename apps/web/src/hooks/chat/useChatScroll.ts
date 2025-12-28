/**
 * useChatScroll Hook
 * Auto-scroll to bottom when new messages arrive
 */

import { useEffect, useRef } from 'react';

export function useChatScroll<T>(dependency: T) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dependency]);

  return scrollRef;
}
