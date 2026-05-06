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
              src="https://images.pexels.com/photos/5031578/pexels-photo-5031578.jpeg" alt="Garbage Truck" 
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
               <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop" alt="General Waste" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h3 className="font-black text-lg mb-1.5 text-slate-900">General Waste</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Household trash & mixed waste</p>
            <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/50 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-wider group-hover:bg-emerald-100 transition-colors">
              Starting from ₹199 
            </div>
          </div>

          <div className="bg-white border text-left border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer">
            <div className="h-44 rounded-xl overflow-hidden mb-5 bg-gray-100 relative">
               <img src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&auto=format&fit=crop" alt="Heavy Furniture" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h3 className="font-black text-lg mb-1.5 text-slate-900">Heavy Furniture</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Sofas, Beds & Wardrobes</p>
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-black uppercase tracking-wider group-hover:bg-slate-100 transition-colors">
              Fixed Removal Fee 
            </div>
          </div>

          <div className="bg-white border text-left border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer">
            <div className="h-44 rounded-xl overflow-hidden mb-5 bg-gray-100 relative">
               <img src="https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&auto=format&fit=crop" alt="E-Waste" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
            </div>
            <h3 className="font-black text-lg mb-1.5 text-slate-900">Plastic Waste</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Clean Plastics, Toys & Containers</p>
            <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/50 text-blue-600 rounded-lg text-xs font-black uppercase tracking-wider group-hover:bg-blue-100 transition-colors">
              Get Paid to Recycle
            </div>
          </div>

          <div className="bg-white border text-left border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer">
            <div className="h-44 rounded-xl overflow-hidden mb-5 bg-gray-100 relative">
               <img src="https://images.unsplash.com/photo-1528323273322-d81458248d40?w=600&auto=format&fit=crop" alt="Garden Waste" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h3 className="font-black text-lg mb-1.5 text-slate-900">Garden Waste</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Leaves, Branches & Trimmings</p>
            <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/50 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-wider group-hover:bg-emerald-100 transition-colors">
              Starting from ₹149 
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
