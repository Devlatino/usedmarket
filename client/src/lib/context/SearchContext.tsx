import React, { createContext, useState, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";
import { Search, Result, Filter, SearchFormValues } from "../types";
import { queryClient } from "../queryClient";
import { useToast } from "@/hooks/use-toast";

interface SearchContextType {
  currentQuery: string;
  searchResults: Result[];
  savedSearches: Search[];
  isSearching: boolean;
  isSavingSearch: boolean;
  resultCount: number;
  performSearch: (values: SearchFormValues) => Promise<void>;
  saveSearch: (values: SearchFormValues) => Promise<void>;
  toggleSavedSearch: (id: number, active: boolean) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentQuery, setCurrentQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Result[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const { toast } = useToast();

  // Fetch saved searches
  const { data: savedSearches = [] } = useQuery({
    queryKey: ['/api/searches'],
    refetchOnWindowFocus: false,
  });

  // Perform search mutation
  const { mutateAsync: searchMutate, isPending: isSearching } = useMutation({
    mutationFn: async (values: SearchFormValues) => {
      const response = await apiRequest('POST', '/api/search', values);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.results);
      setResultCount(data.resultCount);
      setCurrentQuery(data.query);
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to perform search",
        variant: "destructive",
      });
    },
  });

  // Save search mutation
  const { mutateAsync: saveSearchMutate, isPending: isSavingSearch } = useMutation({
    mutationFn: async (values: SearchFormValues) => {
      const response = await apiRequest('POST', '/api/searches', values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/searches'] });
      toast({
        title: "Search Saved",
        description: "You'll receive notifications for new matching listings",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Save Search",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Toggle saved search active status
  const { mutateAsync: toggleSavedSearchMutate } = useMutation({
    mutationFn: async ({ id, active }: { id: number, active: boolean }) => {
      const response = await apiRequest('PATCH', `/api/searches/${id}/toggle`, { active });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/searches'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Search",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const performSearch = async (values: SearchFormValues) => {
    await searchMutate(values);
  };

  const saveSearch = async (values: SearchFormValues) => {
    await saveSearchMutate(values);
  };

  const toggleSavedSearch = async (id: number, active: boolean) => {
    await toggleSavedSearchMutate({ id, active });
  };

  return (
    <SearchContext.Provider
      value={{
        currentQuery,
        searchResults,
        savedSearches,
        isSearching,
        isSavingSearch,
        resultCount,
        performSearch,
        saveSearch,
        toggleSavedSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
