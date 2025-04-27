import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import TabNavigation from '@/components/ui/TabNavigation';
import FilterBar from '@/components/results/FilterBar';
import ResultsGrid from '@/components/results/ResultsGrid';
import { useSearch } from '@/lib/context/SearchContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Filter, 
  getPriceRangeFilter, 
  getLocationFilter, 
  getSortValue
} from '@/lib/types';

const Results: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    currentQuery, 
    searchResults, 
    isSearching, 
    performSearch,
    saveSearch,
    isSavingSearch,
    resultCount
  } = useSearch();
  
  const [filters, setFilters] = useState<Filter>({});
  const [page, setPage] = useState(1);
  const [savedSearch, setSavedSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // If there's no current query, redirect to home
  useEffect(() => {
    if (!currentQuery && !isSearching) {
      setLocation('/');
    }
  }, [currentQuery, isSearching, setLocation]);
  
  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...filters };
    
    if (value === 'any') {
      if (filterType === 'price') delete newFilters.price;
      if (filterType === 'condition') delete newFilters.condition;
      if (filterType === 'location') delete newFilters.location;
      if (filterType === 'sort') delete newFilters.sortBy;
    } else {
      switch (filterType) {
        case 'price':
          newFilters.price = getPriceRangeFilter(value);
          break;
        case 'condition':
          newFilters.condition = value === 'any' ? undefined : value;
          break;
        case 'location':
          newFilters.location = getLocationFilter(value);
          break;
        case 'sort':
          newFilters.sortBy = getSortValue(value);
          break;
      }
    }
    
    setFilters(newFilters);
    
    // Apply filters
    performSearch({ query: currentQuery, filters: newFilters });
  };
  
  const handleSaveSearch = async () => {
    await saveSearch({
      query: currentQuery,
      filters
    });
    setSavedSearch(true);
  };
  
  const loadMoreResults = () => {
    // In a real application, this would fetch more results
    // For this demo, we'll just simulate loading more
    setIsLoadingMore(true);
    setTimeout(() => {
      setPage(prev => prev + 1);
      setIsLoadingMore(false);
      
      toast({
        title: "End of results",
        description: "There are no more results to load."
      });
    }, 1000);
  };
  
  if (!currentQuery && !isSearching) {
    return null; // Will redirect to home
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TabNavigation />
      
      <section>
        <FilterBar 
          searchTerm={currentQuery}
          resultCount={resultCount}
          onFilterChange={handleFilterChange}
        />
        
        {/* Save Search Alert */}
        {!savedSearch && (
          <div className="mb-6 bg-primary-50 border border-primary-200 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <i className="fas fa-bell text-primary-500 mr-3"></i>
              <span className="text-primary-800">Want to be notified when new listings match your search?</span>
            </div>
            <Button 
              onClick={handleSaveSearch}
              className="bg-primary-500 hover:bg-primary-600 text-white"
              disabled={isSavingSearch}
            >
              {isSavingSearch ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Saving...
                </>
              ) : (
                'Save this search'
              )}
            </Button>
          </div>
        )}
        
        {/* Results Grid */}
        <ResultsGrid 
          results={searchResults}
          loading={isSearching}
          hasMore={false} // In a real app, this would be determined by API
          onLoadMore={loadMoreResults}
          isLoadingMore={isLoadingMore}
        />
      </section>
    </main>
  );
};

export default Results;
