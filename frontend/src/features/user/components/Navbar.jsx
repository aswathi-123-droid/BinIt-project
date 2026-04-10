import { Leaf, Wallet, ShoppingBag, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "Services", href: "/services", active: true },
    { name: "Recycling Info", href: "#" },
    { name: "Pricing", href: "#" },
  ];

  const { data: walletData } = useQuery({
    queryKey: ["walletBalance"],
    queryFn: async () => {
      const res = await api.get("/wallet/balance");
      return res.data;
    },
  });

  const balance = walletData?.balance || 0;

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
        {navLinks.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                link.active
                  ? "text-emerald-500"
                  : "text-gray-500 hover:text-emerald-500"
              }`}
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/wishlist")}
          className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100"
          title="Wishlist"
        >
          <Heart size={20} />
        </button>

        <button
          onClick={() => navigate("/cart")}
          className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100"
        >
          <ShoppingBag size={20} />
        </button>

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
      </div>
    </nav>
  );
};

export default Navbar;
