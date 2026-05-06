import { Leaf, Wallet, ShoppingBag, Heart} from "lucide-react";
import { useLocation, useNavigate ,Link} from "react-router-dom";
import { api } from "../../../api/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "Services", href: "/services" },
    { name: "Recycling Info", href: "/recycling" },
    { name: "About", href: "/about" },
  ];

  const { data:cart } = useQuery({
      queryKey: ["cart"],
      queryFn: async () => {
        const res = await api.get("/cart");
        return res.data;
      },
    });
  
  const { data: wishlistData } = useQuery({
    queryKey: ["user-wishlist"],
    queryFn: async () => {
      const res = await api.get("/wishlist");
      return res.data.wishlist;
    },
  });
  
  const cartItemCount = cart?.cart?.items?.reduce((total,item)=> total+(item.quantity || 1),0) || 0
    const wishlistItemCount = wishlistData?.items?.length || 0;
  console.log(cartItemCount)

  return (
    <nav className="w-full bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="text-emerald-500">
          <Leaf size={28} fill="currentColor" fillOpacity={0.2} />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">
          BinIt
        </span>
      </div>

      <ul className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return(
          <li key={link.name}>
            <Link
              to={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive
                  ? "text-emerald-500"
                  : "text-gray-500 hover:text-emerald-500"
              }`}
            >
              {link.name}
            </Link>
          </li>
        )
        })}
      </ul>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/wishlist")}
          className="relative p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100"
          title="Wishlist"
        >
          <Heart size={24} />
          {wishlistItemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
              {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate("/cart")}
          className="relative p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100"
        >
          <ShoppingBag size={24} />
          {cartItemCount > 0 && (
          <span className="absolute -top-1.5 -right-2 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
          )}
        </button>

        {user?(
          <button
          onClick={() => {
            navigate("/profile/my-profile");
          }}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-gray-100 font-bold text-gray-500">
            {user?.avatar && user.avatar.startsWith("http") ? (
              <img
                src={user.avatar}
                alt="User Profile"
                className="w-full h-full object-cover bg-orange-50"
              />
            ) : (
              user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "?"
            )}
          </div>
        </button>
        ):(
           <button
            onClick={() => navigate("/auth/login")}
            className="px-5 py-2 text-sm font-bold text-white bg-emerald-500 rounded-full hover:bg-emerald-600 transition-colors shadow-sm"
          >
            Login
          </button>
        )
        }
      </div>
    </nav>
  );
};

export default Navbar;
