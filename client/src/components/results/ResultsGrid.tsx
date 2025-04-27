import React from 'react';
import ResultCard from './ResultCard';
import { Result } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface ResultsGridProps {
  results: Result[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ 
  results, 
  loading, 
  hasMore, 
  onLoadMore,
  isLoadingMore
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between mb-4">
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="flex justify-between mb-4">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <i className="fas fa-search text-4xl mb-4"></i>
        <h3 className="text-xl font-medium mb-2">No results found</h3>
        <p>Try adjusting your search criteria or try a different search term.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {results.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center px-6 py-3"
          >
            {isLoadingMore ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Loading...
              </>
            ) : (
              <>
                <i className="fas fa-spinner mr-2"></i>
                Load more results
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default ResultsGrid;
