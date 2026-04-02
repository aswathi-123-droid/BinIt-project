import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/axiosInstance";
import { 
  Heart, 
  Trash2, 
  ShoppingBag, 
  ChevronRight, 
  Loader2 
} from "lucide-react";
import toast from "react-hot-toast";

const WishlistPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-wishlist"],
    queryFn: async () => {
      const res = await api.get("/wishlist"); 
      return res.data.wishlist;
    },
    refetchOnWindowFocus: true,
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async (productId) => {
      const res = await api.post("/wishlist/toggle", { productId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-wishlist"] });
      toast.success(data.message || "Removed from wishlist");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    }
  });

  const handleRemoveItem = (e, productId) => {
    e.stopPropagation();
    toggleWishlistMutation.mutate(productId);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    
    const cartItem = {
      productId: product._id,
      image: product.image?.[0],
      type: product.type,
      unit: product.unit,
      category: product.categoryId?.name || "General",
      price: product.price,
      name: product.name,
    };

    try {
      await api.post("/cart/add", cartItem); 
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500 font-bold">
        Failed to load wishlist. Please try again.
      </div>
    );
  }

  const wishlistItems = data?.items || [];

  return (
    <div className="h-210 bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <Link to="/" className="hover:text-emerald-600 cursor-pointer transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/profile" className="hover:text-emerald-600 cursor-pointer transition-colors">Profile</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-bold">My Wishlist</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-8 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl">
            <Heart size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              My Wishlist
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-100">
            <div className="w-24 h-24 bg-red-50 text-red-300 rounded-full flex items-center justify-center mb-6">
               <Heart size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Save items you love to your wishlist. Review them anytime and easily move them to your cart.
            </p>
            <button 
              onClick={() => navigate('/services')}
              className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-sm flex items-center gap-2"
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item.productId;
              if (!product) return null; 

              return (
                <div
                  key={product._id}
                  onClick={() => navigate(`/services/product/${product._id}`)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer relative"
                >
                  <button
                    disabled={toggleWishlistMutation.isPending}
                    onClick={(e) => handleRemoveItem(e, product._id)}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm shadow-sm transition-all duration-200 text-red-500 bg-red-50 hover:bg-red-100 hover:scale-110"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="relative h-44 w-full overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                    <img
                      src={product.image?.[0] || "https://placehold.co/400x300?text=No+Image"}
                      alt={product.name}
                      className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.stock <= 0 && product.type === "store" && (
                         <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white px-2 py-1 rounded-md shadow-sm">
                           <span className="text-[10px] font-bold uppercase tracking-tighter">Out of Stock</span>
                         </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm font-bold text-gray-900 mb-4">
                         ₹{product.price}
                         <span className="text-[10px] font-normal text-gray-400 ml-1">
                           / {product.unit}
                         </span>
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-50">
                      <button
                        onClick={(e) => {
                          if (product.hasVariations || product.isEstimationEnabled) {
                             navigate(`/services/product/${product._id}`);
                          } else {
                             handleAddToCart(e, product);
                          }
                        }}
                        disabled={product.stock <= 0 && product.type === "store"}
                        className={`w-full py-2.5 text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 ${
                           product.stock <= 0 && product.type === "store"
                             ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                             : "bg-slate-800 text-white hover:bg-emerald-500"
                        }`}
                      >
                         {product.stock <= 0 && product.type === "store" ? (
                            "Unavailable"
                         ) : product.hasVariations || product.isEstimationEnabled ? (
                            "Select Options"
                         ) : (
                            <>
                              <ShoppingBag size={16} /> Add to Cart
                            </>
                         )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default WishlistPage;
