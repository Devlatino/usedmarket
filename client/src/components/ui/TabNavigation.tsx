import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface TabNavigationProps {
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ className }) => {
  const [location] = useLocation();

  const tabs = [
    { name: 'Search Results', href: '/results' },
    { name: 'Saved Searches', href: '/saved-searches' },
    { name: 'Notifications', href: '/notifications' },
  ];

  return (
    <div className={cn("border-b border-gray-200 mb-6", className)}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <Link 
            key={tab.name}
            href={tab.href}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
              location === tab.href
                ? "border-primary-500 text-primary-500" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;
