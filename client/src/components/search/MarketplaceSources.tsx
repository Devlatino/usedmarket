import React from 'react';

const MarketplaceSources: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600">
        <span>Searching across:</span>
        <div className="flex items-center space-x-1">
          <i className="fab fa-ebay text-[#e53238]"></i> 
          <span>eBay</span>
        </div>
        <div className="flex items-center space-x-1">
          <i className="fab fa-amazon text-[#ff9900]"></i> 
          <span>Amazon</span>
        </div>
        <div className="flex items-center space-x-1">
          <i className="fab fa-facebook text-[#3b5998]"></i> 
          <span>Facebook Marketplace</span>
        </div>
        <div className="flex items-center space-x-1">
          <i className="fas fa-store text-[#5c2d91]"></i> 
          <span>Craigslist</span>
        </div>
        <div className="flex items-center space-x-1">
          <i className="fas fa-shopping-bag text-[#f47820]"></i> 
          <span>Etsy</span>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceSources;
