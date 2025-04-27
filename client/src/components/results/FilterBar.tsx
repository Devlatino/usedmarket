import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  priceRangeOptions, 
  conditionOptions, 
  locationOptions, 
  sortOptions 
} from '@/lib/types';

interface FilterBarProps {
  searchTerm: string;
  resultCount: number;
  onFilterChange: (filterType: string, value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  searchTerm, 
  resultCount,
  onFilterChange 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="flex items-center">
        <h3 className="text-lg font-medium">
          Results for <span className="font-bold text-primary-600">{searchTerm}</span>
        </h3>
        <div className="bg-gray-100 text-gray-700 text-sm py-1 px-2 rounded-md ml-3">
          {resultCount} results
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Price Range Filter */}
        <Select onValueChange={(value) => onFilterChange('price', value)}>
          <SelectTrigger className="h-9 w-[130px]">
            <SelectValue placeholder={priceRangeOptions[0].label} />
          </SelectTrigger>
          <SelectContent>
            {priceRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Condition Filter */}
        <Select onValueChange={(value) => onFilterChange('condition', value)}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder={conditionOptions[0].label} />
          </SelectTrigger>
          <SelectContent>
            {conditionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Location Filter */}
        <Select onValueChange={(value) => onFilterChange('location', value)}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder={locationOptions[0].label} />
          </SelectTrigger>
          <SelectContent>
            {locationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Sort Order */}
        <Select onValueChange={(value) => onFilterChange('sort', value)}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder={sortOptions[0].label} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterBar;
