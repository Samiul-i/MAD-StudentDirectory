// hooks/use-debounce.ts
import { useEffect, useState } from "react";

// Generic custom hook — works with any value type T.
// Returns a debounced copy of `value` that only updates after the user
// has stopped changing it for `delay` milliseconds.
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    // Start a timer — fires only after the user stops typing.
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    // Cleanup: cancel the timer if `value` changes before it fires.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
