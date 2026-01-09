import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Leaf, 
  Recycle, 
  Sofa, 
  Hammer, 
  Monitor 
} from 'lucide-react';

const UserSidebar = () => {
  const [activeCategory, setActiveCategory] = useState('All Items');

  const categories = [
    {
      group: null,
      items: [
        { name: 'All Items', icon: LayoutGrid, color: 'text-emerald-500', bg: 'bg-emerald-50' }
      ]
    },
    {
      group: 'RECYCLABLES (EARN)',
      items: [
        { name: 'Dry Recyclables', icon: Leaf },
        { name: 'Plastic & Metal', icon: Recycle }
      ]
    },
    {
      group: 'JUNK SERVICES (PAY)',
      items: [
        { name: 'Heavy Furniture', icon: Sofa },
        { name: 'Construction Debris', icon: Hammer },
        { name: 'E-Waste', icon: Monitor }
      ]
    }
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 p-6 flex flex-col gap-8">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">Categories</h2>
        <p className="text-xs text-gray-400 font-medium mt-1">Filter waste types</p>
      </div>

      {/* Navigation Groups */}
      <nav className="flex flex-col gap-6">
        {categories.map((section, sIdx) => (
          <div key={sIdx} className="flex flex-col gap-2">
            {/* Section Label */}
            {section.group && (
              <h3 className="text-[10px] font-black text-emerald-800/60 tracking-widest mb-1 px-3">
                {section.group}
              </h3>
            )}

            {/* List Items */}
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const isActive = activeCategory === item.name;
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveCategory(item.name)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                        : 'text-slate-500 hover:bg-gray-50'
                    }`}
                  >
                    <Icon 
                      size={18} 
                      className={`${isActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-400'}`} 
                    />
                    <span className={`text-sm font-semibold ${isActive ? 'text-emerald-900' : 'text-slate-600'}`}>
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default UserSidebar;