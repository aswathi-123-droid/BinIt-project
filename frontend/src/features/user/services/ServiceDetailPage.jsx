import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import { calculateOfferPrice } from "../../../utils/helpers";
import {
  Heart,
  ZoomIn,
  ShoppingBasket,
  Info,
  Truck,
  ChevronDown,
  Loader2,
  ChevronRight,
} from "lucide-react";
import EstimateView from "./components/serviceDetailViews/EstimationView";
import VariationView from "./components/serviceDetailViews/VariationView";
import DefaultView from "./components/serviceDetailViews/DefaultView";

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedBag, setSelectedBag] = useState("medium");
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({
    display: "none",
    transformOrigin: "center",
  });

  useEffect(() => {
    setActiveImage(0);
  }, [id]);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data.product;
    },
    enabled: !!id,
  });

  const { data: relatedData, isLoading: relatedLoading } = useQuery({
    queryKey: ["related-products", product?.categoryId?._id],
    queryFn: async () => {
      const res = await api.get("/products", {
        params: {
          categoryId: product.categoryId._id,
          limit: 5,
          isActive: true,
        },
      });
      return res.data.items
        .filter((item) => item._id !== product._id)
        .slice(0, 4);
    },
    enabled: !!product?.categoryId?._id,
  });

  useEffect(() => {
    if (!isLoading && product && !product.isActive) {
      navigate("/services");
    }
  }, [product, isLoading, navigate]);

  const queryClient = useQueryClient();
  const { data: wishlistData } = useQuery({
    queryKey: ["user-wishlist"],
    queryFn: async () => {
      const res = await api.get("/wishlist");
      return res.data.wishlist;
    },
  });

  const wishlistedItemIds =
    wishlistData?.items?.map((item) => item.productId._id) || [];

  const toggleWishlistMutation = useMutation({
    mutationFn: async (productId) => {
      const res = await api.post("/wishlist/toggle", { productId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-wishlist"] });

      if (data.isWishlisted) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    },
  });

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlistMutation.mutate(product._id);
  };

  const isWishlisted = product ? wishlistedItemIds.includes(product._id) : false;

  const handleAddToCart = async () => {
    if (!product) return;

    let finalItem = {
      productId: product._id,
      image: product.image?.[0],
      type: product.type,
      unit: product.unit,
      category: product.categoryId.name,
      price: product.price,
    };

    if (product.hasVariations && selectedVariation) {
      finalItem.name = `${product.name} (${selectedVariation.name})`;
      finalItem.price = selectedVariation.price;
      finalItem.selectionType = "variation";
      finalItem.selectionName = selectedVariation.name;
    } else if (product.isEstimationEnabled && selectedBag) {
      finalItem.name = `${product.name} (${selectedBag.name})`;
      finalItem.price = selectedBag.price;
      finalItem.selectionType = "estimation";
      finalItem.selectionName = selectedBag.name;
    } else {
      finalItem.name = product.name;
      finalItem.price = product.price;
      if (!product.hasVariations && !product.isEstimationEnabled) {
          finalItem.quantity = Number(quantity);
      }
    }

    try {
      await api.post("/cart/add", finalItem);
      toast.success(`${finalItem.name} added to cart`);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );

  if (isError || !product || !product.isActive)
    return (
      <div className="text-center py-20 text-red-500 font-bold">
        Product not found or Unavailable
      </div>
    );

  console.log(product);
  const handleMouseMove = (e) => {
    const { width, height } = e.currentTarget.getBoundingClientRect();

    const x = (e.nativeEvent.offsetX / width) * 100;
    const y = (e.nativeEvent.offsetY / height) * 100;

    setZoomStyle({
      display: "block",
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2)",
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      display: "none",
      transformOrigin: "center",
      transform: "scale(1)",
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <Link className="hover:text-emerald-600 cursor-pointer">Home</Link>

          <ChevronRight size={14} />

          <Link
            to="/services"
            className="hover:text-emerald-600 cursor-pointer"
          >
            Services
          </Link>

          <ChevronRight size={14} />

          <span className="text-slate-800 font-bold">{product.name}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 py-8">
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            {product.image?.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                  activeImage === i
                    ? "border-emerald-500 shadow-md"
                    : "border-gray-100 hover:border-emerald-200"
                }`}
                alt="thumb"
              />
            ))}
          </div>
          <div className="relative flex-1 group overflow-hidden rounded-2xl shadow-sm cursor-zoom-in bg-gray-50">
            <div
              className="w-full h-full relative"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={product.image?.[activeImage]}
                style={{
                  transform: zoomStyle.transform || "scale(1)",
                  transformOrigin: zoomStyle.transformOrigin,
                }}
                className="w-full aspect-square object-cover transition-transform duration-150 ease-out"
                alt="main"
              />

              <div className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-600 group-hover:opacity-0 transition-opacity pointer-events-none">
                <ZoomIn size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-start mb-2">
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[9px] font-bold uppercase tracking-wider rounded-md">
              {product?.categoryId?.name}
            </span>

            {product?.type === "store" && (
              <button
                onClick={handleWishlistToggle}
                className={`p-2 rounded-full transition-colors ${isWishlisted ? "text-red-500 bg-red-50" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-5">
            {product?.offer?.isActive && new Date(product.offer.expiryDate) > new Date() ? (
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 line-through font-semibold leading-tight">
                  ₹{product.price}
                  <span className="text-xs font-normal"> / {product.unit}</span>
                </span>
                <p className={`text-xl font-medium ${product.isEstimationEnabled ? " text-emerald-600" : "text-gray-950"}`}>
                  {product.type === "recyclable" ? "Earn " : product.type === "junk" ? "From " : ""}
                  <span className="text-xl font-bold">₹{calculateOfferPrice(product.price, product.offer).toFixed(2)}</span>
                  <span className="text-sm text-gray-500 ml-1">/ {product.unit}</span>
                </p>
              </div>
            ) : (
                <p
                  className={`text-xl font-medium ${product.isEstimationEnabled ? " text-emerald-600" : "text-gray-950"}`}
                >
                  {product.type === "recyclable"
                    ? "Earn "
                    : product.type === "junk"
                      ? "From "
                      : ""}
                  <span className="text-xl font-bold">₹{product.price}</span>{" "}
                  <span className=" text-sm text-gray-500">/ {product.unit}</span>
                </p>
            )}

            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase rounded">
              Best Price
            </span>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            {product.isEstimationEnabled ? (
              <EstimateView
                product={product}
                setSelectedBag={setSelectedBag}
                selectedBag={selectedBag}
              />
            ) : product.hasVariations ? (
              <VariationView
                product={product}
                selectedVariation={selectedVariation}
                setSelectedVariation={setSelectedVariation}
              />
            ) : (
              <DefaultView
                product={product}
                quantity={quantity}
                setQuantity={setQuantity}
              />
            )}

            <div className="mt-8 flex items-center justify-between">
              <button 
                onClick={handleAddToCart}
                className="bg-emerald-500 hover:bg-emerald-600 text-white w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                <ShoppingBasket size={18} /> Add to Bin
              </button>
            </div>
          </div>
        </div>
      </main>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">You might also have</h2>
          {/* <button className="text-emerald-500 text-sm font-bold">
            View all →
          </button> */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedLoading ? (
            <Loader2 className="animate-spin text-emerald-500 mx-auto" />
          ) : (
            relatedData?.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  navigate(`/services/product/${item._id}`);
                  window.scrollTo(0, 0);
                }}
                className="group cursor-pointer bg-white rounded-4xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500"
              >
                <div className="relative aspect-square bg-slate-50 p-6 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image?.[0]}
                    className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-emerald-600 shadow-sm border border-emerald-50">
                    ₹{item.price}/{item.unit}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-black text-slate-800 mb-1 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <button className="w-full py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                    Quick View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ServiceDetailPage;
