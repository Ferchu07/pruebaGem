import { useState, useCallback } from 'react';

interface FilterFilters {
  [key: string]: any;
}

interface FilterOrder {
  field: string;
  order: 'asc' | 'desc';
}

export type FilterOrders = FilterOrder[];

export interface FilterOptions {
  filter_filters?: FilterFilters;
  filter_order?: FilterOrders;
  limit: number;
  page: number;
}

const useFilters = (initialFilters: FilterFilters = {}, initialOrders: FilterOrders = [], startPage: number = 1, limit: number = 50, defaultFilterFilters: FilterFilters = {}) => {

  const [currentPage, setCurrentPage] = useState(startPage);
  const [currentPageSize, setCurrentPageSize] = useState(limit);
  const [initialFiltersState] = useState<FilterFilters>(initialFilters);
  const [initialOrdersState] = useState<FilterOrders>(initialOrders);

  const [filters, setFilters] = useState<FilterOptions>({
    filter_filters: initialFiltersState,
    filter_order: initialOrdersState,
    page: currentPage,
    limit: currentPageSize,
  });

  const updateFilters = (newFilters: FilterFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      filter_filters: {
        ...prevFilters.filter_filters,
        ...newFilters,
      }
    }));
  };

  const updateFilterOrder = useCallback(
    (keyValue: string, order: "asc" | "desc") => {
      const newFilterOrder: FilterOrders = [{
        field: keyValue,
        order: order
      }]

      setFilters((prevFilters) => ({
        ...prevFilters,
        filter_order: newFilterOrder,
      }));
    }, [setFilters]);

  /* const getFilter = (key: string): any => {
    return filters.filter_filters && filters.filter_filters[key];
  } */

  const resetFilters = useCallback((limit: number = 50, hardReset: boolean = false) => {
    setFilters({
      filter_filters: hardReset ? {} : defaultFilterFilters,
      filter_order: hardReset ? [] : initialOrdersState,
      page: 1,
      limit: limit,
    });
  }, [defaultFilterFilters, initialOrdersState]);


  const updatePage = (pageSelected: any) => {
    pageSelected.selected++
    if (currentPage !== pageSelected.selected) {
      setCurrentPage(pageSelected.selected);
      updateFilters({ page: pageSelected.selected });
      setFilters({
        ...filters,
        page: pageSelected.selected
      });
    }
  }

  const updatePageSize = (pageSelected: any) => {
    if (currentPageSize !== pageSelected.value) {
      setCurrentPageSize(pageSelected.value);
      setFilters({
        ...filters,
        limit: pageSelected.value
      });
    }
  }

  return { filters, updateFilters, resetFilters, updateFilterOrder, updatePage, updatePageSize };
};

export default useFilters;