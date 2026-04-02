import React from "react";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
      <div className="w-24 h-24 mb-6 bg-emerald-50 rounded-full flex items-center justify-center border-8 border-emerald-50/50">
        <ShoppingCart strokeWidth={1.5} className="w-10 h-10 text-emerald-500" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Your Bin is Empty
      </h2>
      <p className="text-gray-500 max-w-md mb-8">
        Looks like you haven't added any items just yet. Browse our store or setup a junk pickup service today.
      </p>

      <button
        onClick={() => navigate("/services")} 
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-sm shadow-emerald-200 hover:shadow-emerald-300 transform hover:-translate-y-0.5 active:scale-95 transition-all"
      >
        <span>Browse Items</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default EmptyCart;
