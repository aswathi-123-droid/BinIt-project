import { Trash2, Info, Minus, Plus, Loader2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import EmptyCart from "./EmptyCart";
import { useState } from "react";
import { calculateBestDiscount } from "../../../utils/helpers";
import AvailableCouponsModal from "./AvailableCouponModal";

const BinItCart = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data;
    },
  });

  const updateQtyMutation = useMutation({
    mutationFn: (payload) => api.patch("/cart/quantity", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Could not update quantity");
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId) => api.delete(`/cart/remove/${itemId}`),
    onSuccess: () => {
      toast.success("Item removed from the cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Could not remove item");
    },
  });

  const applyCouponMutation = useMutation({
    mutationFn: (code) => api.post("/cart/apply-coupon", { code }),
    onSuccess: () => {
      toast.success("Coupon applied successfully!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Invalid or expired coupon code",
      );
      setCouponCode("");
    },
  });

  const removeCouponMutation = useMutation({
    mutationFn: () => api.post("/cart/remove-coupon"),
    onSuccess: () => {
      toast.success("Coupon removed!");
      setCouponCode("");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) => {
      toast.error("Could not remove coupon");
    },
  });

  const cartItems = data?.cart?.items || [];

  const hasUnavailableItems = cartItems.some(
    (item) => !item.productId?.isActive,
  );

  const handleCheckout = async () => {
    if (hasUnavailableItems) {
      toast.error("Please remove unavailable items from your cart to proceed.");
      return;
    }
    try {
      setIsVerifying(true);
      const res = await api.get("/cart/validate-checkout");

      const cartData = res.data?.data?.cart || res.data?.cart;
      const freshCartItems = cartData?.items || [];
      let hasStockIssue = false;
      for (const item of freshCartItems) {
        if (
          item.productId?.type === "store" &&
          Number(item.quantity) > Number(item.productId?.stock || 0)
        ) {
          hasStockIssue = true;
          toast.error(
            `Low stock for ${item.name}. Only ${item.productId?.stock || 0} left. Please reduce quantity.`,
          );
        }
      }
      if (hasStockIssue) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        return;
      }

      navigate("/checkout");
    } catch (error) {
      console.error("Verification Error:", error);
      toast.error("Failed to verify cart. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );

  if (isError)
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load cart.{error?.message}
      </div>
    );

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  const isPayout = data?.summary?.totalAmount < 0;
  const displayAmount = Math.abs(data?.summary?.totalAmount || 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-2">
            Home / Browse / Cart /{" "}
            <span className="text-gray-900 font-medium">Checkout</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">
            Order & Pickup Summary
          </h1>
          <p className="text-gray-500">
            Review your pickup items and finalize your order.
          </p>
        </div>

        {hasUnavailableItems && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2 border border-red-100">
            <Info className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              One or more items in your cart are no longer available. Please
              remove them to proceed.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Trash2 className="text-emerald-500 w-5 h-5" /> Items in Your
                  Bin
                </h2>
                <span className="text-gray-400 text-sm">
                  {cartItems.length} items
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => {
                  const isUnavailable = !item?.productId?.isActive;
                  const itemDiscount = calculateBestDiscount(
                    item.price,
                    item.productId?.offer,
                    item.productId?.categoryId?.offer,
                    item.quantity
                  );
                  const finalPrice = item.price - itemDiscount;

                  return (
                    <div
                      key={item._id}
                      className={`py-6 flex flex-col sm:flex-row gap-4 transition-all ${
                        isUnavailable
                          ? "opacity-60 grayscale bg-gray-50/50"
                          : ""
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`w-20 h-20 rounded-xl object-cover ${isUnavailable ? "bg-gray-200" : "bg-gray-100"}`}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center flex-wrap gap-2">
                              <h3
                                className={`font-bold ${isUnavailable ? "text-gray-500 line-through" : "text-gray-900"}`}
                              >
                                {item.name}
                              </h3>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full ${
                                  item.productId?.type === "store"
                                    ? "bg-blue-100 text-blue-700"
                                    : item.productId?.type === "junk"
                                      ? "bg-gray-100 text-gray-600"
                                      : "bg-emerald-100 text-emerald-600"
                                }`}
                              >
                                {item.productId?.categoryId?.name}
                              </span>

                              {isUnavailable && (
                                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Unavailable
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.productId?.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                              {item.productId?.type === "recyclable"
                                ? "You Earn"
                                : "Fee"}
                            </p>

                            {itemDiscount > 0 && !isUnavailable ? (
                              <div className="flex flex-col items-end gap-0.5 mt-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-400 line-through font-medium">
                                    ₹{item.price}
                                  </span>
                                  <span className="whitespace-nowrap text-[10px] bg-red-50 border border-red-100 text-red-600 font-bold px-2 py-0.5 rounded uppercase animate-pulse">
                                    - ₹{itemDiscount} OFF
                                  </span>
                                </div>
                                <span className="font-black text-xl text-emerald-600 leading-none">
                                  ₹{finalPrice}
                                </span>
                              </div>
                            ) : (
                              <p
                                className={`font-bold text-lg ${
                                  isUnavailable
                                    ? "text-gray-400"
                                    : item.productId?.type === "recyclable"
                                      ? "text-emerald-500"
                                      : item.productId?.type === "junk"
                                        ? "text-gray-900"
                                        : "text-blue-700"
                                }`}
                              >
                                ₹{item.price}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div
                            className={`flex items-center border border-gray-200 rounded-lg ${isUnavailable ? "bg-gray-100" : "bg-gray-50"}`}
                          >
                            <button
                              className="p-1 px-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={
                                isUnavailable ||
                                item.quantity <= 1 ||
                                updateQtyMutation.isPending
                              }
                              onClick={() =>
                                updateQtyMutation.mutate({
                                  productId: item.productId?._id,
                                  selectionName: item.selectionName,
                                  action: "decrement",
                                })
                              }
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-4 text-sm font-bold">
                              {item.quantity}
                            </span>
                            <button
                              className="p-1 px-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={
                                isUnavailable ||
                                (updateQtyMutation.isPending &&
                                  updateQtyMutation.variables?.productId ===
                                    item.productId?._id)
                              }
                              onClick={() =>
                                updateQtyMutation.mutate({
                                  productId: item.productId?._id,
                                  selectionName: item.selectionName,
                                  action: "increment",
                                })
                              }
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="flex gap-4 text-xs font-semibold">
                            <button
                              onClick={() =>
                                removeItemMutation.mutate(item._id)
                              }
                              disabled={
                                removeItemMutation.isPending &&
                                removeItemMutation.variables === item._id
                              }
                              className="text-red-500 flex items-center gap-1 hover:underline disabled:opacity-50"
                            >
                              {removeItemMutation.isPending &&
                              removeItemMutation.variables === item._id ? (
                                "Removing..."
                              ) : (
                                <>
                                  <Trash2 size={14} /> Remove
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm border-b pb-6 mb-6">
                {data?.summary?.storeItems > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Store Items</span>
                    <span className="font-bold text-gray-800">
                      ₹{data?.summary?.storeItems}
                    </span>
                  </div>
                )}
                {data?.summary?.pickupServices > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>PickupService</span>
                    <span className="font-bold text-gray-800">
                      ₹{data?.summary?.pickupServices}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal (Service Fees)</span>
                  <span className="font-bold text-gray-800">
                    ₹{data?.summary?.subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Estimated Earnings</span>
                  <span className="font-bold text-emerald-500">
                    -₹{data?.summary?.earnings}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Coupon</span>
                  <span className="font-bold text-emerald-500">
                    -₹{data?.summary?.couponDiscount || 0}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Total Discount</span>
                  <span className="font-bold text-emerald-500">
                    -₹{data?.summary?.offerDiscount || 0}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Platform Fee</span>
                  <span className="font-bold text-gray-800">
                    ₹{data?.summary?.platformFee}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                  Coupon Code
                </p>

                {data?.cart?.appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold tracking-wider">
                        APPLIED
                      </span>
                      <span className="text-sm font-semibold text-emerald-900">
                        Coupon Active!
                      </span>
                    </div>
                    <button
                      onClick={() => removeCouponMutation.mutate()}
                      disabled={removeCouponMutation.isPending}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter Coupon Code"
                      className="flex-1 bg-gray-50 border-none rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none uppercase font-semibold"
                      disabled={applyCouponMutation.isPending}
                    />
                    <button
                      onClick={() =>
                        couponCode.trim()
                          ? applyCouponMutation.mutate(couponCode)
                          : toast.error("Enter a code first")
                      }
                      disabled={
                        applyCouponMutation.isPending || !couponCode.trim()
                      }
                      className="bg-slate-900 hover:bg-slate-800 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      {applyCouponMutation.isPending ? "Applying..." : "Apply"}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="text-emerald-500 text-xs font-bold mt-3 flex items-center gap-1 hover:underline w-fit"
                >
                  🏷️ View Available Coupons
                </button>
              </div>

              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-xl font-black text-gray-800">
                    {isPayout ? "TOTAL EARNINGS" : "TOTAL"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {isPayout
                      ? "Amount will be added to your Wallet"
                      : "Inclusive of all taxes & earnings"}
                  </p>
                </div>
                <p
                  className={`text-2xl font-black ${isPayout ? "text-emerald-600" : "text-gray-800"}`}
                >
                  ₹{displayAmount.toLocaleString()}.00
                </p>
              </div>

              <button
                onClick={handleCheckout}
                className={`w-full ${
                  cartItems.length > 0 && !hasUnavailableItems
                    ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 hover:shadow-emerald-300 transform hover:-translate-y-0.5 active:scale-95"
                    : "bg-gray-300 cursor-not-allowed shadow-none grayscale opacity-70"
                } text-white py-4 rounded-xl font-bold text-lg transition-all`}
                disabled={cartItems.length === 0 || hasUnavailableItems}
              >
                Proceed to Checkout
              </button>
              <p className="text-[10px] text-center text-gray-400 mt-4">
                By proceeding, you agree to our{" "}
                <span className="underline cursor-pointer">
                  Terms of Service
                </span>
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 flex gap-3 border border-blue-100">
              <div className="bg-blue-500 p-1 rounded-full h-fit mt-1">
                <Info size={14} className="text-white" />
              </div>
              <div>
                <p className="text-blue-900 text-[11px] font-bold uppercase mb-1">
                  Price Guarantee
                </p>
                <p className="text-blue-700 text-[11px] leading-relaxed">
                  Final fees are calculated based on the actual volume/weight
                  measured at the time of pickup.
                </p>
              </div>
            </div>
          </div>
        </div>
        <AvailableCouponsModal
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          cartSubtotal={(data?.summary?.subtotal || 0) - (data?.summary?.offerDiscount || 0)}
          onApply={(code) => {
            setCouponCode(code);
            applyCouponMutation.mutate(code);
            setIsCouponModalOpen(false);
          }}
        />
      </main>
    </div>
  );
};

export default BinItCart;
