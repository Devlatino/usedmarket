import React from 'react';
import SearchBar from '@/components/search/SearchBar';
import MarketplaceSources from '@/components/search/MarketplaceSources';

const Home: React.FC = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Find used items across all marketplaces
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Enter what you're looking for and we'll search all major platforms to find the best used options.
          </p>
        </div>
        
        <SearchBar />
        <MarketplaceSources />
      </section>
      
      <section className="bg-gray-50 rounded-lg p-8 text-center max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col items-center">
            <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-search text-xl"></i>
            </div>
            <h4 className="text-lg font-semibold mb-2">1. Search</h4>
            <p className="text-gray-600">Enter what you're looking for in our unified search bar</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-bell text-xl"></i>
            </div>
            <h4 className="text-lg font-semibold mb-2">2. Save</h4>
            <p className="text-gray-600">Save your searches to get notifications for new listings</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-check-circle text-xl"></i>
            </div>
            <h4 className="text-lg font-semibold mb-2">3. Find</h4>
            <p className="text-gray-600">Get the best deals from all major marketplaces in one place</p>
          </div>
        </div>
      </section>
      
      <section className="my-16 text-center">
        <h3 className="text-2xl font-bold mb-4">Marketplaces We Search</h3>
        <div className="flex flex-wrap justify-center items-center gap-8 mt-8">
          <div className="flex flex-col items-center">
            <i className="fab fa-ebay text-4xl text-[#e53238] mb-2"></i>
            <span className="font-medium">eBay</span>
          </div>
          <div className="flex flex-col items-center">
            <i className="fab fa-amazon text-4xl text-[#ff9900] mb-2"></i>
            <span className="font-medium">Amazon</span>
          </div>
          <div className="flex flex-col items-center">
            <i className="fab fa-facebook text-4xl text-[#3b5998] mb-2"></i>
            <span className="font-medium">Facebook Marketplace</span>
          </div>
          <div className="flex flex-col items-center">
            <i className="fas fa-store text-4xl text-[#5c2d91] mb-2"></i>
            <span className="font-medium">Craigslist</span>
          </div>
          <div className="flex flex-col items-center">
            <i className="fas fa-shopping-bag text-4xl text-[#f47820] mb-2"></i>
            <span className="font-medium">Etsy</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
