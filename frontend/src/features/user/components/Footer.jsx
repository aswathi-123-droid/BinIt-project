import React from 'react';
import { Leaf, Globe, Share2, Mail, HelpCircle } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-gray-100 font-sans">

      <div className="border-t border-gray-50 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © {currentYear} BinIt Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs font-medium text-gray-500">
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
            <a href="#" className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors font-bold">
              Need Help? <HelpCircle size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;