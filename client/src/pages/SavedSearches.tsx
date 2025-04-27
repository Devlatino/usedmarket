import React from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import TabNavigation from '@/components/ui/TabNavigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Search } from '@/lib/types';
import { queryClient, apiRequest } from '@/lib/queryClient';

const SavedSearches: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Fetch saved searches
  const { data: searches = [] as Search[], isLoading } = useQuery<Search[]>({
    queryKey: ['/api/searches'],
  });
  
  // Toggle search active status
  const { mutate: toggleSearch } = useMutation({
    mutationFn: async ({ id, active }: { id: number, active: boolean }) => {
      const response = await apiRequest('PATCH', `/api/searches/${id}/toggle`, { active });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/searches'] });
      toast({
        title: "Search Updated",
        description: "Your search notifications have been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update search",
        variant: "destructive",
      });
    },
  });
  
  // View search results
  const viewResults = async (search: Search) => {
    try {
      // Fetch results for this search
      const response = await fetch(`/api/searches/${search.id}/results`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      
      // Store results in localStorage to be displayed on the results page
      localStorage.setItem('currentSearchResults', JSON.stringify({
        query: search.query,
        filters: search.filters,
        results: await response.json()
      }));
      
      // Navigate to results page
      setLocation('/results');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to view search results",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabNavigation />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TabNavigation />
      
      {searches.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
            <i className="fas fa-search text-2xl"></i>
          </div>
          <h3 className="text-xl font-medium mb-2">No saved searches yet</h3>
          <p className="text-gray-500 mb-6">Save a search to get notified when new listings are available</p>
          <Button onClick={() => setLocation('/')}>
            Start Searching
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searches.map((search) => (
            <Card key={search.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{search.query}</CardTitle>
                  <Switch 
                    checked={search.active}
                    onCheckedChange={(checked) => {
                      toggleSearch({ id: search.id, active: checked });
                    }}
                    aria-label="Toggle notifications"
                  />
                </div>
                <CardDescription>
                  {search.active ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <i className="fas fa-bell text-xs mr-1"></i> Notifications on
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      <i className="fas fa-bell-slash text-xs mr-1"></i> Notifications off
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  <p>Created: {new Date(search.createdAt).toLocaleDateString()}</p>
                  {search.filters && Object.keys(search.filters).length > 0 && (
                    <p className="mt-2">
                      <span className="font-medium">Filters:</span> {Object.keys(search.filters).join(', ')}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => viewResults(search)}
                >
                  <i className="fas fa-list-ul mr-2"></i>
                  View Results
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
};

export default SavedSearches;
