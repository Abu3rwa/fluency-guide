import { useState, useEffect, useCallback } from "react";

const useDebouncedSearch = (initialValue = "", delay = 300) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  // Update search term
  const updateSearchTerm = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    updateSearchTerm,
    clearSearch,
  };
};

export default useDebouncedSearch;
