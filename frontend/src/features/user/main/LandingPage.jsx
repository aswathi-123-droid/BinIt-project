import React from 'react';
import { 
  Smartphone, 
  Calendar, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  Facebook, 
  Twitter, 
  Instagram, 
  Menu,
  Leaf
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate()
  return (
    <div className="font-sans text-slate-900 overflow-x-hidden">
     
      <section className="px-6 md:px-12 py-12 md:py-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6 md:pr-8 text-center lg:text-left">
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight text-slate-900">
            Your Trash, <span className="text-emerald-500">Our<br className="hidden lg:block"/> Problem.</span> Scheduled.
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-md mx-auto lg:mx-0">
            The smartest way to dispose of household waste. We remove your junk—on your schedule.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button 
            onClick={()=>navigate("/services")}
            className="w-full sm:w-auto bg-emerald-500 text-white px-8 py-4 rounded-full font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/30 active:scale-95">
              Schedule a Pickup
            </button>
          </div>
        </div>
        
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10">
            <img 
              src="data:image/jpeg;base64,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" 
              alt="Garbage Truck" 
              className="w-full h-auto object-cover aspect-video lg:aspect-auto lg:h-112.5" 
            />
          </div>
          
          {/* <div className="absolute -bottom-8 lg:-bottom-6 -left-4 lg:-left-12 bg-white/95 backdrop-blur shadow-2xl p-4 rounded-2xl flex items-center gap-4 border border-gray-100 z-20 animate-bounce cursor-default" style={{ animationDuration: '3.5s' }}>
            <div className="bg-emerald-100/50 p-3 rounded-xl text-emerald-600">
              <Leaf size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Waste Removed</p>
              <p className="text-xl md:text-2xl font-black text-slate-900">800 kg</p>
            </div>
            <div className="ml-2 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-xs font-black shadow-sm border border-emerald-100">
              +14%
            </div>
          </div> */}
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-50 rounded-full blur-3xl -z-10 opacity-70"></div>
        </div>
      </section>

      <section className="bg-gray-50/50 py-24 px-6 md:px-12 mt-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900">How It Works</h2>
          <p className="text-gray-500 mb-16 max-w-xl mx-auto text-lg">
            Turn your waste problems into peace of mind in three simple steps.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-11 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-gray-200 z-0"></div>

            <div className="flex flex-col items-center relative z-10 group">
              <div className="w-24 h-24 bg-white rounded-4xl flex items-center justify-center text-emerald-500 shadow-xl shadow-gray-200/50 mb-6 border border-gray-100 group-hover:-translate-y-2 transition-transform duration-300">
                <Smartphone size={36} strokeWidth={1.5} />
              </div>
              <h3 className="font-black text-lg mb-3">Select Your Waste</h3>
              <p className="text-gray-500 text-sm max-w-62.5 text-center leading-relaxed">
                Choose from General Waste, Heavy Junk, or E-Waste categories.
              </p>
            </div>
            
            <div className="flex flex-col items-center relative z-10 group">
              <div className="w-24 h-24 bg-white rounded-4xl flex items-center justify-center text-emerald-500 shadow-xl shadow-gray-200/50 mb-6 border border-gray-100 group-hover:-translate-y-2 transition-transform duration-300">
                <Calendar size={36} strokeWidth={1.5} />
              </div>
              <h3 className="font-black text-lg mb-3">Schedule Slot</h3>
              <p className="text-gray-500 text-sm max-w-62.5 text-center leading-relaxed">
                Pick a date and time that works for your busy schedule.
              </p>
            </div>

            <div className="flex flex-col items-center relative z-10 group">
              <div className="w-24 h-24 bg-white rounded-4xl flex items-center justify-center text-emerald-500 shadow-xl shadow-gray-200/50 mb-6 border border-gray-100 group-hover:-translate-y-2 transition-transform duration-300">
                <Truck size={36} strokeWidth={1.5} />
              </div>
              <h3 className="font-black text-lg mb-3">Hassle-Free Removal</h3>
              <p className="text-gray-500 text-sm max-w-62.5 text-center leading-relaxed">
                We pick up your waste, leaving you with a perfectly clean home.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900">What We Collect</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            From newspapers to old sofas, we handle it all with care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border text-left border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer">
            <div className="h-44 rounded-xl overflow-hidden mb-5 bg-gray-100 relative">
               <img src="https://images.unsplash.com/photo-1506456073715-9988ef11ac30?w=600&auto=format&fit=crop" alt="General Waste" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h3 className="font-black text-lg mb-1.5 text-slate-900">General Waste</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Household trash & mixed waste</p>
            <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/50 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-wider group-hover:bg-emerald-100 transition-colors">
              Starting from ₹199 <ArrowRight size={16} />
            </div>
          </div>

          <div className="bg-white border text-left border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer">
            <div className="h-44 rounded-xl overflow-hidden mb-5 bg-gray-100 relative">
               <img src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&auto=format&fit=crop" alt="Heavy Furniture" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h3 className="font-black text-lg mb-1.5 text-slate-900">Heavy Furniture</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Sofas, Beds & Wardrobes</p>
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-black uppercase tracking-wider group-hover:bg-slate-100 transition-colors">
              Fixed Removal Fee <ArrowRight size={16} />
            </div>
          </div>

          <div className="bg-white border text-left border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer">
            <div className="h-44 rounded-xl overflow-hidden mb-5 bg-gray-100 relative">
               <img src="https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&auto=format&fit=crop" alt="E-Waste" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
            </div>
            <h3 className="font-black text-lg mb-1.5 text-slate-900">E-Waste</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Old Phones, Cables & Appliances</p>
            <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/50 text-blue-600 rounded-lg text-xs font-black uppercase tracking-wider group-hover:bg-blue-100 transition-colors">
              Free Disposal Fee <ArrowRight size={16} />
            </div>
          </div>

          <div className="bg-white border text-left border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer">
            <div className="h-44 rounded-xl overflow-hidden mb-5 bg-gray-100 relative">
               <img src="https://images.unsplash.com/photo-1528323273322-d81458248d40?w=600&auto=format&fit=crop" alt="Garden Waste" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h3 className="font-black text-lg mb-1.5 text-slate-900">Garden Waste</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Leaves, Branches & Trimmings</p>
            <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/50 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-wider group-hover:bg-emerald-100 transition-colors">
              Starting from ₹149 <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-24 px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900">Why Choose BinIt?</h2>
            <p className="text-gray-500 mb-12 text-lg max-w-lg leading-relaxed">
              We are redefining waste management with technology, transparency, and a commitment to the environment.
            </p>

            <div className="space-y-10">
              <div className="flex gap-5">
                <div className="text-emerald-500 mt-1 bg-emerald-50 p-2.5 rounded-full h-fit"><CheckCircle2 size={24} strokeWidth={2.5} /></div>
                <div>
                  <h4 className="font-extrabold text-xl mb-1.5 text-slate-900">Transparent Pricing</h4>
                  <p className="text-gray-500 text-base leading-relaxed">No hidden fees or unexpected charges at pickup.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="text-emerald-500 mt-1 bg-emerald-50 p-2.5 rounded-full h-fit"><CheckCircle2 size={24} strokeWidth={2.5} /></div>
                <div>
                  <h4 className="font-extrabold text-xl mb-1.5 text-slate-900">Easy Scheduling</h4>
                  <p className="text-gray-500 text-base leading-relaxed">Book a pickup in minutes using our intuitive app.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="text-emerald-500 mt-1 bg-emerald-50 p-2.5 rounded-full h-fit"><CheckCircle2 size={24} strokeWidth={2.5} /></div>
                <div>
                  <h4 className="font-extrabold text-xl mb-1.5 text-slate-900">Eco-Friendly Disposal</h4>
                  <p className="text-gray-500 text-base leading-relaxed">Responsible waste management that prioritizes recycling.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 relative h-112.5 lg:h-150 rounded-[3rem] overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop" alt="Eco Growth" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center p-8">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-center text-white max-w-xs shadow-2xl">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Leaf size={32} />
                </div>
                <h3 className="text-2xl font-black mb-3">Join the Movement</h3>
                <p className="text-sm text-white/90 font-medium leading-relaxed">Be part of the solution for a greener, cleaner planet.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
          <div className="py-2 md:py-0">
            <h3 className="text-4xl md:text-5xl text-emerald-400 font-black mb-3">10,000+ <span className="text-2xl">kg</span></h3>
            <p className="text-xs tracking-[0.2em] font-bold uppercase text-white/50">Waste Managed</p>
          </div>
          <div className="py-8 md:py-0">
            <h3 className="text-4xl md:text-5xl text-emerald-400 font-black mb-3">500+</h3>
            <p className="text-xs tracking-[0.2em] font-bold uppercase text-white/50">Happy Households</p>
          </div>
          <div className="py-8 md:py-0">
            <h3 className="text-4xl md:text-5xl text-emerald-400 font-black mb-3">Zero</h3>
            <p className="text-xs tracking-[0.2em] font-bold uppercase text-white/50">Landfill Policy</p>
          </div>
        </div>
      </section>

     
      {/* <footer className="bg-white pt-24 pb-8 px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          <div className="lg:col-span-5 pr-0 lg:pr-12">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-2xl mb-6">
              <Leaf size={28} />
              <span className="text-slate-900">BinIt</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
              Making waste management simple, professional, and accessible for everyone. 
              Schedule your pickup today and let us handle the rest.
            </p>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200 transition-all"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200 transition-all"><Twitter size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200 transition-all"><Instagram size={18} /></a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-extrabold mb-6 text-sm uppercase tracking-wider text-slate-900">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-extrabold mb-6 text-sm uppercase tracking-wider text-slate-900">Platform</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Download App</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Partner Login</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Admin Portal</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Help Center</a></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-extrabold mb-6 text-sm uppercase tracking-wider text-slate-900">Stay Updated</h4>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">Subscribe to our newsletter for exclusive eco tips.</p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <button className="bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
                Subscribe
              </button>
            </div>
          </div>
        </div>


        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-medium text-gray-400">
          <p>© 2026 BinIt Technologies. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Cookies</a>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default LandingPage;
