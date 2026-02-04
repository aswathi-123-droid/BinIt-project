import { Leaf, Wallet, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate()
  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Services', href: '/services', active: true },
    { name: 'Recycling Info', href: '#' },
    { name: 'Pricing', href: '#' },
  ];

  return (
    <nav className="w-full bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      

      <div className="flex items-center gap-2 cursor-pointer">
        <div className="text-emerald-500">
          <Leaf size={28} fill="currentColor" fillOpacity={0.2} />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">BinIt</span>
      </div>


      <ul className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                link.active 
                  ? 'text-emerald-500' 
                  : 'text-gray-500 hover:text-emerald-500'
              }`}
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>


      <div className="flex items-center gap-4">
        

        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors">
          <Wallet size={18} className="text-emerald-600" />
          <span className="text-sm font-bold text-emerald-700">₹200</span>
        </div>


        <button className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100">
          <ShoppingBag size={20} />
        </button>

        <button onClick={()=>{console.log("Hiii");navigate("/profile/my-profile")}}>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200 cursor-pointer hover:opacity-90 transition-opacity">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="User Profile" 
            className="w-full h-full object-cover bg-orange-50"
          />
          </div>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;