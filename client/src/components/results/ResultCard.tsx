import React, { useState, useEffect } from 'react';
import { Result, getRelativeTime, marketplaceInfo } from '@/lib/types';

interface ResultCardProps {
  result: Result;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  
  // Elabora l'URL dell'immagine al caricamento o quando cambia
  useEffect(() => {
    if (!result.imageUrl) {
      setImgSrc(undefined);
      return;
    }
    
    // Pulisci e normalizza l'URL dell'immagine
    let url = result.imageUrl;
    
    // Rimuovi parametri di query che possono limitare la qualità
    url = url.replace(/\?.+$/, '');
    
    // Sostituisci URL di immagini thumbnail con versioni più grandi per alcuni siti
    if (url.includes('thumbs.') && result.marketplace === 'ebay') {
      url = url.replace('thumbs.', 'i.');
    }
    
    setImgSrc(url);
    setImageError(false);
  }, [result.imageUrl, result.marketplace]);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };
  
  const marketplaceData = marketplaceInfo[result.marketplace as keyof typeof marketplaceInfo] || {
    name: 'Unknown',
    icon: 'fa-shopping-bag',
    color: '#888888',
  };
  
  // Immagine di placeholder personalizzata in base al marketplace
  const getPlaceholderImage = () => {
    return `https://via.placeholder.com/800x400?text=No+Image+(${marketplaceData.name})`;
  };
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-200">
      <div className="relative h-48">
        {imageError || !imgSrc ? (
          // Visualizza un elemento div come fallback con uno stile di base
          <div 
            className="w-full h-full bg-gray-100 flex items-center justify-center"
            style={{
              backgroundImage: `url(${getPlaceholderImage()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <span className="text-sm text-gray-500">Immagine non disponibile</span>
          </div>
        ) : (
          // Prova a caricare l'immagine
          <img 
            src={imgSrc}
            alt={result.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              setImageError(true);
              const target = e.target as HTMLImageElement;
              target.src = getPlaceholderImage();
            }}
          />
        )}
        <div className="absolute top-3 left-3 bg-gray-100 text-xs font-medium px-2 py-1 rounded flex items-center">
          <i className={`${marketplaceData.icon.startsWith('fa-') ? 'fab' : 'fas'} ${marketplaceData.icon} mr-1`} style={{ color: marketplaceData.color }}></i>
          {marketplaceData.name}
        </div>
        <button 
          className={`absolute top-3 right-3 ${isFavorite ? 'text-primary-500' : 'text-gray-200 hover:text-primary-500'} transition-colors`}
          onClick={toggleFavorite}
        >
          <i className={`${isFavorite ? 'fas' : 'far'} fa-heart text-xl`}></i>
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1 line-clamp-2">{result.title}</h3>
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-xl">{result.price}</div>
          <div className="text-xs text-gray-500">
            {result.postedAt ? getRelativeTime(result.postedAt) : 'Date unknown'}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <i className="fas fa-tag mr-1"></i>
            <span>{result.condition || 'Condition not specified'}</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-map-marker-alt mr-1"></i>
            <span>{result.location || 'Location not specified'}</span>
          </div>
        </div>
        <a 
          href={result.listingUrl} 
          className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition-colors" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          View Listing
        </a>
      </div>
    </div>
  );
};

export default ResultCard;
