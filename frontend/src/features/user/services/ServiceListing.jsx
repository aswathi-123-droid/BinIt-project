import React from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import UserSidebar from './components/Sidebar';

const ServiceListing = () => {
  // Sample Data matching your screenshot
  const items = [
    { id: 1, type: 'Recyclable', category: 'Paper', title: 'Old Newspapers', desc: 'Clean, dry newspapers stack.', rate: 'Earn ₹14 / kg', image: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?q=80&w=400' },
    { id: 2, type: 'Recyclable', category: 'Plastic', title: 'PET Bottles', desc: 'Crushed or whole bottles.', rate: 'Earn ₹8 / kg', image: 'https://images.unsplash.com/photo-1613254025696-6f70717208ba?q=80&w=400', active: true },
    { id: 3, type: 'Service', category: 'Furniture', title: '3-Seater Sofa', desc: 'Heavy lifting required.', rate: 'Fee ₹500 / unit', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400' },
    { id: 4, type: 'Service', category: 'Debris', title: 'Rubble Sacks', desc: 'Standard size rubble bags.', rate: 'Fee ₹150 / bag', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400' },
    { id: 5, type: 'Recyclable', category: 'Paper', title: 'Cardboard', desc: 'Flattened corrugated boxes.', rate: 'Earn ₹10 / kg', image: 'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?q=80&w=400' },
    { id: 6, type: 'Eco-Dispose', category: 'E-Waste', title: 'Old Laptop/PC', desc: 'Safe disposal of electronics.', rate: 'Fee ₹200 / unit', image: 'https://images.unsplash.com/photo-1588702547919-26089e690eca?q=80&w=400' },
  ];

  return (
    <div className=' flex'>
          <UserSidebar></UserSidebar>
          <div className="flex-1 bg-gray-50 min-h-screen p-6 font-sans">
          
            {/* Top Bar: Search and Sort */}
            <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-8">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search for newspaper, sofa, bottles..." 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Sort By:</span>
                <span className="text-sm font-semibold text-gray-800">Price Low-High</span>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>

            {/* Grid of Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {items.map((item) => (
                <div key={item.id} className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl ${item.active ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-gray-100 shadow-sm'}`}>
                  {/* Image Section */}
                  <div className="relative h-44 w-full overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                      <div className={`w-2 h-2 rounded-full ${item.type === 'Recyclable' ? 'bg-emerald-500' : item.type === 'Service' ? 'bg-slate-800' : 'bg-blue-500'}`}></div>
                      <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tighter">{item.type}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wide mb-2">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-1">{item.desc}</p>
                    
                    <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">Rate</p>
                        <p className={`text-sm font-bold ${item.rate.includes('Earn') ? 'text-emerald-600' : 'text-gray-900'}`}>{item.rate}</p>
                      </div>
                      <button className="px-5 py-1.5 bg-gray-100 hover:bg-emerald-500 hover:text-white transition-colors text-gray-800 text-sm font-bold rounded-lg shadow-sm">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer: Pagination & Copyright */}
            <div className="flex flex-col items-center gap-8 border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between w-full text-xs text-gray-500">
                <span>Showing 1 to 8 of 28 results</span>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-gray-200 rounded border border-gray-200"><ChevronLeft size={16} /></button>
                  <button className="w-8 h-8 bg-emerald-500 text-white rounded font-bold">1</button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded font-medium">2</button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded font-medium">3</button>
                  <button className="p-1 hover:bg-gray-200 rounded border border-gray-200"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
};

export default ServiceListing;