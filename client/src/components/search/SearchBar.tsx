import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useSearch } from '@/lib/context/SearchContext';
import { SearchFormValues, searchFormSchema } from '@/lib/types';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SearchBar: React.FC = () => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const { performSearch } = useSearch();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: '',
    },
  });

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearch = async (values: SearchFormValues) => {
    setShowSuggestions(false);
    
    // Save to recent searches
    const newRecentSearches = [
      values.query,
      ...recentSearches.filter(s => s !== values.query)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    
    // Perform search
    await performSearch(values);
    
    // Navigate to results page
    setLocation('/results');
  };

  const selectSuggestion = (suggestion: string) => {
    form.setValue('query', suggestion);
    form.handleSubmit(handleSearch)();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchInput = document.getElementById('search-input');
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        event.target !== searchInput
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto relative">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)}>
          <div className="search-animation bg-white shadow-md rounded-lg p-1 flex items-center">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      {...field}
                      // Simplify by using only the field.ref
                      ref={field.ref}
                      className="w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none rounded-lg"
                      placeholder="Cosa stai cercando? (es. 'iPhone 12', 'lampada da scrivania vintage')"
                      onFocus={() => {
                        if (recentSearches.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      // Instead of using ref for input targeting, use id for query selector
                      id="search-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
            >
              <i className="fas fa-search mr-2"></i>
              Cerca
            </Button>
          </div>
        </form>
      </Form>

      {/* Search suggestions */}
      {showSuggestions && recentSearches.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="bg-white mt-1 rounded-lg shadow-lg absolute z-10 w-full max-w-2xl"
        >
          {recentSearches.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => selectSuggestion(suggestion)}
            >
              <i className="fas fa-history text-gray-400 mr-2"></i>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
