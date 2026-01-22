'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the viewport matches a given media query.
 * @param query - The CSS media query string, e.g., '(min-width: 1024px)'.
 * @returns True if the viewport matches the query, false otherwise.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);

        const handleChange = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
}
