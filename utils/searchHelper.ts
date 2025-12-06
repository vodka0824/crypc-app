
import { Product, Category, ProductSpecs } from '../types';

/**
 * Generates a searchable string from a product's properties.
 */
const getProductSearchText = (p: Product): string => {
  return [
    p.name,
    p.id,
    p.description,
    p.category, // Include category name
    p.specDetails?.brand || '',
    ...Object.values(p.specDetails || {}) // Include all spec values
  ].join(' ').toLowerCase();
};

/**
 * Unified logic for filtering products based on:
 * 1. Category (optional)
 * 2. Search Query (supports space for AND, pipe | for OR)
 * 3. Specific Attribute Filters (activeFilters)
 */
export const filterProducts = (
  products: Product[],
  searchQuery: string,
  category: string | null = 'All', // Can be 'All', specific Category, or null (ignore)
  activeFilters: Record<string, string[]> = {}
): Product[] => {
  return products.filter((product: Product) => {
    // 1. Category Filter
    if (category && category !== 'All' && product.category !== category) {
      return false;
    }

    // 2. Search Query
    if (searchQuery.trim()) {
      const queryRaw = searchQuery.toLowerCase();
      const productText = getProductSearchText(product);
      
      // Logic: Split by '|' for OR groups, then by space for AND requirements within groups
      const orGroups = queryRaw.split('|');
      
      const matchesSearch = orGroups.some(group => {
        const andTerms = group.trim().split(/\s+/).filter(t => t);
        if (andTerms.length === 0) return false;
        return andTerms.every(term => productText.includes(term));
      });

      if (!matchesSearch) return false;
    }

    // 3. Attribute/Spec Filters
    if (Object.keys(activeFilters).length > 0) {
      const matchesFilters = Object.entries(activeFilters).every(([key, selectedValues]: [string, string[]]) => {
        if (selectedValues.length === 0) return true;
        
        const productValue = product.specDetails?.[key as keyof ProductSpecs];
        if (!productValue) return false;
        
        // Handle comma-separated values in product specs (e.g. "LGA1700, AM5")
        const values = productValue.split(',').map((s: string) => s.trim());
        return values.some((v: string) => selectedValues.includes(v));
      });
      
      if (!matchesFilters) return false;
    }

    return true;
  });
};

/**
 * Calculates available filter options dynamically based on the current search/filter state.
 * (Cascading filters logic)
 */
export const getSmartOptions = (
    allProducts: Product[],
    category: Category,
    targetFilterKey: keyof ProductSpecs,
    searchQuery: string,
    activeFilters: Record<string, string[]>
): string[] => {
    // Filter products based on search and *other* filters (excluding the current target key)
    const otherFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([k]) => k !== targetFilterKey)
    );

    const relevantProducts = filterProducts(allProducts, searchQuery, category, otherFilters);

    const values = new Set<string>();
    relevantProducts.forEach((p: Product) => {
        if (p.specDetails?.[targetFilterKey]) {
            // Split multi-value specs for option generation
            p.specDetails[targetFilterKey]!.split(',').forEach((v: string) => values.add(v.trim()));
        }
    });

    return Array.from(values).sort();
};
