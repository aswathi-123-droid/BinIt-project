import React from 'react';
import { MonitorSmartphone, Newspaper, Package, Layers, Info } from 'lucide-react';

const recyclableItems = [
  {
    icon: MonitorSmartphone,
    title: 'E-Waste',
    description: 'Old smartphones, laptops, cables, batteries, and broken household electronics.',
  },
  {
    icon: Package,
    title: 'Plastics & Glass',
    description: 'Clean PET bottles, containers, glass jars, and recyclable packaging materials.',
  },
  {
    icon: Newspaper,
    title: 'Paper & Cardboard',
    description: 'Old newspapers, magazines, office paper, and flattened cardboard boxes.',
  },
  {
    icon: Layers,
    title: 'Metal & Scrap',
    description: 'Aluminum cans, iron scrap, copper wires, and old metal fixtures.',
  }
];

const RecyclingInfoSection = () => {
  return (
    <section className="py-16 bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h3 className="text-emerald-500 font-bold tracking-wider uppercase text-sm mb-2">
            What We Collect
          </h3>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">
            Recycling Made Simple
          </h2>
          <p className="text-gray-500 text-base">
            Sort your items into these basic categories before your pickup arrives. 
            Proper sorting helps us recycle more efficiently and gets you better rewards!
          </p>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {recyclableItems.map((item, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all duration-300 text-center group"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <item.icon size={28} strokeWidth={2} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start sm:items-center gap-3 max-w-3xl mx-auto">
          <Info className="text-blue-500 shrink-0 mt-0.5 sm:mt-0" size={20} />
          <p className="text-sm text-blue-800 font-medium">
            <span className="font-bold">Pro Tip:</span> Please ensure all containers are rinsed and electronics are disconnected before your pickup agent arrives.
          </p>
        </div>

      </div>
    </section>
  );
};

export default RecyclingInfoSection;