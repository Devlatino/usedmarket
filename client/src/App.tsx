import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Results from "@/pages/Results";
import SavedSearches from "@/pages/SavedSearches";
import Notifications from "@/pages/Notifications";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NotificationsPanel from "@/components/layout/NotificationsPanel";
import { NotificationProvider } from "@/lib/context/NotificationContext";
import { SearchProvider } from "@/lib/context/SearchContext";

// Add font awesome
const addFontAwesome = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(link);
};

// Add title and description
const updateMetaTags = () => {
  document.title = 'FindUsed - Search Used Items Across Marketplaces';
  
  // Add meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', 'Find the best used items across all major marketplaces with automated notifications for new listings.');
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/results" component={Results} />
      <Route path="/saved-searches" component={SavedSearches} />
      <Route path="/notifications" component={Notifications} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Add font awesome and meta tags
  addFontAwesome();
  updateMetaTags();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotificationProvider>
          <SearchProvider>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Header />
              <div className="flex-grow">
                <Router />
              </div>
              <Footer />
              <NotificationsPanel />
              <Toaster />
            </div>
          </SearchProvider>
        </NotificationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
