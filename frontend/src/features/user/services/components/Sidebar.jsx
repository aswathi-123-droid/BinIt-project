import React, { useState } from 'react';
import { 
  LayoutGrid, 
  ChevronRight,
  Package,
  ChevronsRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../api/axiosInstance';


const UserSidebar = ({ onFilterChange }) => {
  const [activeId, setActiveId] = useState('All Items');

  const { data, isLoading } = useQuery({
    queryKey: ["user-categories"],
    queryFn: async () => {
      const res = await api.get("/categories", { 
        params: { status: "true" } 
      });
      return res.data;
    },
    staleTime: 10 * 60 * 1000, 
  });

  const handleSelection = (id, type, value, displayName) => {
    console.log(`id:${id},type:${type},value:${value},displayName:${displayName}`)
    setActiveId(displayName || id);
    onFilterChange(type === 'all' ? {} : { [type]: value });
  };
  console.log(data)

  const sections = [
    {
      group: 'RECYCLABLES (EARN)',
      type: 'recyclable',
      items: data?.categories?.filter(c => c.type === 'recyclable') || []
    },
    {
      group: 'JUNK SERVICES (PAY)',
      type: 'junk',
      items: data?.categories?.filter(c => c.type === 'junk') || []
    },
    {
      group: 'STORE (BUY)',
      type: 'store',
      items: data?.categories?.filter(c => c.type === 'store') || []
    }
  ];
  console.log(sections)
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 p-6 flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Categories</h2>
        <p className="text-xs text-gray-400 font-medium mt-1">Filter waste types</p>
      </div>

      <nav className="flex flex-col gap-6">
        <button
          onClick={() => handleSelection('all', 'all', null, 'All Items')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
            activeId === 'All Items' 
              ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
              : 'text-slate-500 hover:bg-gray-50'
          }`}
        >
          <LayoutGrid size={18} className={activeId === 'All Items' ? 'text-emerald-500' : 'text-slate-400'} />
          <span className={`text-sm font-semibold ${activeId === 'All Items' ? 'text-emerald-900' : 'text-slate-600'}`}>
            All Items
          </span>
        </button>

        {isLoading ? (
          <div className="px-3 text-xs text-gray-400">Loading categories...</div>
        ) : (
          sections.map((section) => (
            <div key={section.group} className="flex flex-col gap-2">
              <button 
                onClick={() => handleSelection(section.group, 'type', section.type, section.group)}
                className={`text-[10px] font-black tracking-widest mb-1 px-3 text-left transition-colors ${
                  activeId === section.group ? 'text-emerald-600' : 'text-emerald-800/60 hover:text-emerald-600'
                }`}
              >
                {section.items.length!==0 && section.group}
              </button>

              <div className="flex flex-col gap-1">
                {section.items.map((cat) => {
                  const isActive = activeId === cat.name;
                  return (
                    <button
                      key={cat._id}
                      onClick={() => handleSelection(cat._id, 'categoryId', cat._id, cat.name)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                          : 'text-slate-500 hover:bg-gray-50'
                      }`}
                    >
                      <ChevronsRight 
                        size={18} 
                        className={isActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-400'} 
                      />
                      <span className={`text-sm font-semibold ${isActive ? 'text-emerald-900' : 'text-slate-600'}`}>
                        {cat.name}
                      </span>
                      {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
};

export default UserSidebar;