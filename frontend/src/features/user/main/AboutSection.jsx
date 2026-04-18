import React from 'react';
import { Leaf, Recycle, ShieldCheck, Globe } from 'lucide-react';

const coreValues = [
  {
    icon: Leaf,
    title: 'Eco-First Approach',
    description: 'We prioritize the environment in every step, ensuring your waste is handled with the utmost ecological responsibility.',
  },
  {
    icon: Recycle,
    title: 'Circular Economy',
    description: 'By recycling and recovering resources, we help reduce landfill impact and give old materials a new life.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted & Reliable',
    description: 'Verified pickup agents, transparent tracking, and secure processes guarantee a hassle-free experience.',
  },
  {
    icon: Globe,
    title: 'Community Driven',
    description: 'We empower households and businesses to actively participate in building a cleaner, greener tomorrow.',
  },
];

const AboutSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Intro */}
        <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
          <div className="md:w-1/2">
            <h3 className="text-emerald-500 font-bold tracking-wider uppercase text-sm mb-3">
              About Us
            </h3>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-6 leading-tight">
              Pioneering a Cleaner, <br className="hidden md:block" />
              Greener Future
            </h2>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-6">
              We believe that responsible waste management shouldn't be a chore—it should be seamless, rewarding, and transparent. Our platform bridges the gap between households, businesses, and recycling facilities.
            </p>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed">
              Whether it's everyday recyclables, bulky junk, or e-waste, our dedicated fleet and smart tracking system ensure your disposals are managed with professional care.
            </p>
          </div>
          
  
          <div className="md:w-1/2 relative">
            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(16,185,129,0.12)]">
         
              <img 
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Recycling and environment" 
                className="w-full h-full object-cover"
              />
            </div>
  
            <div className="absolute -bottom-6 -left-6 bg-emerald-500 text-white p-6 rounded-2xl shadow-lg hidden sm:block">
              <p className="text-3xl font-black mb-1">10k+</p>
              <p className="text-emerald-50 text-sm font-medium uppercase tracking-wider">Pickups Completed</p>
            </div>
          </div>
        </div>

        {/* Core Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((value, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:bg-white hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors duration-300">
                <value.icon 
                  size={24} 
                  strokeWidth={2.5} 
                  className="text-emerald-500 group-hover:text-white transition-colors duration-300" 
                />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{value.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutSection;