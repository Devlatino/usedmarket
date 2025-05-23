import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link href="/about" className="text-gray-500 hover:text-gray-700">
              About
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-700">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-700">
              Terms
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-700">
              Contact
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center md:text-right text-gray-500">
              &copy; {new Date().getFullYear()} FindUsed. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
