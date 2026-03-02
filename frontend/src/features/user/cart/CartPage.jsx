import React, { useState } from "react";
import {
  Trash2,
  Edit2,
  Upload,
  Info,
  Bell,
  Search,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BinItCart = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data;
    },
  });
  console.log(data);

  const updateQtyMutation = useMutation({
    mutationFn: (payload) => api.patch("/cart/quantity", payload),
    onSuccess: () => {
      // Invalidate query to trigger automatic recalculation of summary
      queryClient.invalidateQueries(["cart"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Could not update quantity");
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId) => api.delete(`/cart/remove/${itemId}`),
    onSuccess: () => {
      toast.success("Item removed from the cart");
      queryClient.invalidateQueries(["cart"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Could not remove item");
    },
  });

  const handleCheckout = () => {
    const cartItems = data?.cart?.items || [];

    for (const item of cartItems) {
      if (
        item.productId.type == "store" &&
        item.quantity > item.productId.stock
      ) {
        toast.error(
          `Low stock for ${item.name}. Only ${item.productId.stock} left.`,
        );
        return;
      }
    }
    navigate("/checkout");
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );

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
            Your Waste Bin & Checkout
          </h1>
          <p className="text-gray-500">
            Review your pickup items and finalize your order.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Trash2 className="text-emerald-500 w-5 h-5" /> Items in Your
                  Bin
                </h2>
                <span className="text-gray-400 text-sm">
                  {data?.cart?.items?.length} items
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {data?.cart?.items?.map((item) => (
                  <div
                    key={item._id}
                    className="py-6 flex flex-col sm:flex-row gap-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {item.name}{" "}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ml-2 ${item.productId.type === "store" ? "bg-blue-100 text-blue-700" : item.productId.type === "junk" ? "bg-gray-100 text-gray-600" : "bg-emerald-100 text-emerald-600"}`}
                            >
                              {item.productId.categoryId.name}
                            </span>
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.productId.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-lg ${item.productId.type === "recyclable" ? "text-emerald-500" : item.productId.type === "junk" ? "text-gray-900" : "text-blue-700"}`}
                          >
                            {item.productId.type === "recyclable"
                              ? "Earn: "
                              : "Fee: "}
                            ₹{item.price}
                          </p>
                          {/* <p className="text-[10px] text-gray-400 uppercase">{item.id === 2 ? 'Estimated Volume' : 'Fixed Fee'}</p> */}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border-gray-200 border rounded-lg bg-gray-50">
                          <button
                            className="p-1 px-2 hover:bg-gray-200"
                            disabled={
                              item.quantity <= 1 || updateQtyMutation.isPending
                            }
                            onClick={() =>
                              updateQtyMutation.mutate({
                                productId: item.productId._id,
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
                            className="p-1 px-2 hover:bg-gray-200"
                            disabled={updateQtyMutation.isPending}
                            onClick={() =>
                              updateQtyMutation.mutate({
                                productId: item.productId._id,
                                selectionName: item.selectionName,
                                action: "increment",
                              })
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="flex gap-4 text-xs font-semibold">
                          {/* <button className="text-emerald-500 flex items-center gap-1 hover:underline"><Edit2 size={14} /> Edit</button> */}
                          <button
                            onClick={() => removeItemMutation.mutate(item._id)}
                            disabled={removeItemMutation.isPending}
                            className="text-red-500 flex items-center gap-1 hover:underline"
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
                ))}
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
                  <span className="font-bold text-emerald-500">-₹0</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Total Discount</span>
                  <span className="font-bold text-emerald-500">-₹0</span>
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    className="flex-1 bg-gray-50 border-none rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-emerald-500"
                  />
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">
                    Apply
                  </button>
                </div>
                <button className="text-emerald-500 text-xs font-bold mt-2 flex items-center gap-1">
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
                className={`w-full bg-linear-to-r ${
                  data?.cart?.items.length > 0
                    ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 hover:shadow-emerald-300 transform hover:-translate-y-0.5 active:scale-95"
                    : "bg-gray-300 cursor-not-allowed shadow-none grayscale opacity-70"
                } text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-100 hover:opacity-90 transition-opacity`}
                disabled={data?.cart?.items.length == 0}
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
      </main>
    </div>
  );
};

export default BinItCart;

//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//               <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
//                 <Upload className="text-emerald-500 w-5 h-5" /> Upload Pictures
//                 of Your Trash
//               </h2>
//               <p className="text-sm text-gray-500 mb-6">
//                 Help our team prepare by uploading photos of the items.
//               </p>

//               <div className="space-y-4">
//                {wasteItems.length > 0 ? (
//   wasteItems.map((item) => (
//     <div
//       key={item._id}
//       className="flex items-center justify-between p-4 border border-dashed rounded-xl border-gray-200"
//     >
//       <div>
//         <p className="font-bold text-sm text-gray-800">{item.name}</p>
//         <p className="text-xs text-gray-400">
//           Upload a photo of the {item.name.toLowerCase()}.
//         </p>
//         {/* Optional: Show how many images are currently uploaded */}
//         {item.userUploadedImages?.length > 0 && (
//           <div>
//               <p className="text-[10px] text-emerald-600 font-bold mt-1">
//             ✓ {item.userUploadedImages.length} images added
//           </p>
//           <div>
//             {/* <img src={item.userUploadedImages[0]} alt="" /> */}
//           </div>
//           </div>

//         )}
//       </div>

//       <div className="flex gap-3">
//         {/* 1. Hidden File Input */}
//         <input
//           type="file"
//           id={`file-upload-${item._id}`}
//           className="hidden"
//           multiple
//           accept="image/*"
//           onChange={(e) => handleFileChange(e, item.productId._id, item.selectionName)}
//         />

//         {/* 2. Visual Upload Button (UI Only) */}
//         <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
//           {uploadMutation.isPending && uploadMutation.variables?.get("productId") === item.productId._id ? (
//             <Loader2 className="animate-spin" size={18} />
//           ) : (
//             <Upload size={18} />
//           )}
//         </div>

//         {/* 3. Action Button linked to the Hidden Input */}
//         <label
//           htmlFor={`file-upload-${item._id}`}
//           className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center ${
//             uploadMutation.isPending ? "bg-gray-100 text-gray-400" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
//           }`}
//         >
//           {uploadMutation.isPending && uploadMutation.variables?.get("productId") === item.productId._id
//             ? "Uploading..."
//             : `Upload Photo for ${item.name.split(" ")[0]}`
//           }
//         </label>
//       </div>
//     </div>
//   ))
// ) : (
//   <p className="text-sm text-gray-400 italic">No pickup items requiring photos.</p>
// )}
//               </div>
//             </div>
