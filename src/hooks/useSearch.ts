import { useMemo } from 'react';

export function useSearch<T extends Record<string, any>>(
  items: T[],
  searchKeys: (keyof T)[],
  searchTerm: string
): T[] {
  return useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      return items;
    }

    const lowerSearch = searchTerm.toLowerCase();

    return items.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(lowerSearch);
      })
    );
  }, [items, searchKeys, searchTerm]);
}
