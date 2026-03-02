import React, { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../api/axiosInstance";
import {
  ChevronLeft,
  Download,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Package,
  Phone,
  Loader2,
  AlertCircle,
  Calendar, // Added Calendar Icon
} from "lucide-react";
import StatusBadge from "./components/StatusBadge";
import CancelOrderModal from "./components/CancelOrderModal";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const { orderId } = useParams();
  const location = useLocation();

  // 1. Determine mode: 'pickup' or 'order' based on URL
  const isPickupMode = location.pathname.includes("/pickup/");

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const queryClient = useQueryClient();

  // Fetch order details
  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await api.get(`/order/${encodeURIComponent(orderId)}`);
      return res.data.order;
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (reason) => {
      console.log("Cancelling with reason:", reason);
      // Send reason as an object { reason: "..." }
      const res = await api.post(
        `/order/${encodeURIComponent(orderId)}/cancel`,
        { reason },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Request cancelled successfully");
      queryClient.invalidateQueries(["order", orderId]);
      setIsCancelModalOpen(false);
      setIsCancelling(false);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to cancel request";
      toast.error(message);
      setIsCancelling(false);
    },
  });

  const cancelOrderItemMutation = useMutation({
    mutationFn: async ({ itemId, reason }) => {
      const res = await api.put(
        `/order/${encodeURIComponent(orderId)}/item/${itemId}/cancel`,
        { reason },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Item cancelled successfully");
      queryClient.invalidateQueries(["order", orderId]);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to cancel item";
      toast.error(message);
    },
  });

  const handleCancelItem = (itemId) => {
    if (window.confirm("Are you sure you want to cancel this item?")) {
      cancelOrderItemMutation.mutate({ itemId, reason: "User removed item" });
    }
  };

  // const handleCancelOrder = (reason) => {
  //   setIsCancelling(true);
  //   cancelOrderMutation.mutate(reason);
  // };

    const handleCancelOrder = async (reason) => {
    setIsCancelling(true);

    try {
      // Loop through only the displayItems (the ones currently visible on screen)
      const cancelPromises = displayItems.map((item) =>
        // Notice we are importing the mutationFn logic directly to bypass React Query limitations in loops
        api.put(`/order/${encodeURIComponent(order.orderId)}/item/${item._id}/cancel`, {
          reason: reason,
        })
      );

      // Fire all cancellation requests simultaneously and wait for them to finish
      await Promise.all(cancelPromises);

      // Upon success, trigger the success actions
      toast.success(
        isPickupMode 
          ? "All pickup items cancelled successfully" 
          : "All store items cancelled successfully"
      );
      
      // Tell React Query to refetch the fresh order data silently in the background
      queryClient.invalidateQueries(["order", order.orderId]);
      
      // Close the modal
      setIsCancelModalOpen(false);
    } catch (error) {
      // Handle any potential errors during the loop
      const message = error.response?.data?.message || "Failed to cancel some items. Please try again.";
      toast.error(message);
    } finally {
      // Always stop the loading spinner whether it succeeded or failed
      setIsCancelling(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-4">
        <AlertCircle className="text-red-500" size={48} />
        <h2 className="text-xl font-bold text-gray-800">Order not found</h2>
        <Link
          to={isPickupMode ? "/profile/my-pickups" : "/profile/my-orders"}
          className="text-emerald-600 font-bold hover:underline"
        >
          Back to List
        </Link>
      </div>
    );
  }

  // 2. Filter Items logic
  const displayItems = order.items.filter((item) =>
    isPickupMode
      ? item.productId?.type !== "store"
      : item.productId?.type === "store",
  );

  // 3. Dynamic Timeline Steps
  const timelineSteps = [
    {
      label: isPickupMode ? "Request Placed" : "Order Placed",
      date: order.createdAt,
      status: "Placed",
    },
    {
      label: isPickupMode ? "Confirmed" : "Payment Confirmed",
      date: order.createdAt,
      status: "Confirmed",
    },
    {
      label: isPickupMode ? "Agent Assigned" : "Shipped",
      date: null,
      status: isPickupMode ? "Assigned" : "Shipped",
    },
    {
      label: isPickupMode ? "Pickup Completed" : "Delivered",
      date: null,
      status: isPickupMode ? "Completed" : "Delivered",
    },
  ];

  // Status Order Logic
  const statusOrder = [
    "Placed",
    "Confirmed",
    isPickupMode ? "Assigned" : "Shipped",
    isPickupMode ? "Completed" : "Delivered",
  ];
  const currentStatusIndex = statusOrder.indexOf(order.status);
  const isAllitemCancelled = displayItems.every(item => item.itemStatus == "Cancelled")
  console.log(displayItems)
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header & Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link to="/" className="hover:text-emerald-600">
                Home
              </Link>{" "}
              /
              <Link
                to={isPickupMode ? "/profile/my-pickups" : "/profile/my-orders"}
                className="hover:text-emerald-600"
              >
                {isPickupMode ? "My Pickups" : "My Orders"}
              </Link>{" "}
              /
              <span className="text-gray-900 font-medium">
                #{order.orderId}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {isPickupMode ? "Pickup Details" : "Order Details"}{" "}
                <span className="text-gray-400 font-medium text-xl">
                  #{order.orderId}
                </span>
              </h1>
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>

        {/* PICKUP SPECIFIC: Time Slot Card */}
        {isPickupMode && (
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm text-blue-600">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide opacity-80 mb-1">
                  Scheduled Pickup Time
                </p>
                <h3 className="text-lg font-bold text-gray-900">
                  {new Date(order.pickupDate).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  <span className="mx-2 text-gray-400">•</span>
                  {order.pickupTimeSlot}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm overflow-x-auto">
          <h3 className="font-bold text-gray-900 mb-8">
            {isPickupMode ? "Pickup Timeline" : "Order Timeline"}
          </h3>
          <div className="flex items-center justify-between min-w-150 relative">
            {/* Connecting Line */}
            <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 z-0"></div>
            <div
              className="absolute top-4 left-0 h-1 bg-emerald-500 z-0 transition-all duration-500"
              style={{
                width: `${(currentStatusIndex / (statusOrder.length - 1)) * 100}%`,
              }}
            ></div>

            {timelineSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-3 relative z-10 group"
                >
                  <div
                    className={`
                                        w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                                        ${
                                          isCompleted
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110"
                                            : "bg-white border-2 border-gray-200 text-gray-300"
                                        }
                                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle size={16} strokeWidth={3} />
                    ) : (
                      <Clock size={16} />
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-sm font-bold ${isCompleted ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {step.label}
                    </p>
                    {step.date && isCompleted && (
                      <p className="text-[10px] text-gray-400 font-medium mt-1">
                        {new Date(step.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-gray-900">
              {isPickupMode ? "Items for Pickup" : "Items in Order"}
            </h3>

            {/* Cancel Button Logic */}
            {!["Cancelled", "Delivered", "Completed", "Returned"].includes(
              order.status,
            ) && (!isAllitemCancelled) && (
              <button
                className="text-red-500 text-xs font-bold hover:underline"
                onClick={() => setIsCancelModalOpen(true)}
              >
                {isPickupMode ? "Cancel Pickup" : "Cancel Order"}
              </button>
            )}
          </div>

          {/* Table Header */}
          <div className="hidden sm:flex items-center px-2 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase ">
            <div className="flex-1 pl-4 text-left">Product</div>
            <div className="flex items-center justify-between gap-12 text-sm w-auto">
              <div className="text-center w-15">Quantity</div>
              <div className="text-center w-20">
                {isPickupMode ? "Est. Price" : "Unit Price"}
              </div>
              <div className="text-center w-20">Total</div>
              <div className="text-center w-20">Status</div>
              <div className="text-center w-20">Action</div>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {displayItems.map((item, idx) => {
              const imgSrc =
                item.image ||
                (item.productId?.image && item.productId.image[0]);

              return (
                <div
                  key={idx}
                  className="p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center overflow-hidden">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="text-gray-300" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {isPickupMode
                        ? item.productId?.type === "junk"
                          ? "Junk / Scrap"
                          : "Recyclable"
                        : "Store Item"}
                    </p>
                  </div>

                  {/* Meta Columns */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-12 text-sm">
                    <div className="text-center w-15">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider md:hidden mb-1">
                        Quantity
                      </span>
                      <span className="font-bold text-gray-700">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="text-center w-20">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider md:hidden mb-1">
                        Unit Price
                      </span>
                      <span className="font-medium text-gray-900">
                        ₹{item.price}
                      </span>
                    </div>
                    <div className="text-right min-w-20">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider md:hidden mb-1">
                        Total
                      </span>
                      <span className="font-bold text-gray-900">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                    <div className="text-right min-w-20">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider md:hidden mb-1">
                        Status
                      </span>
                      <span className="font-bold text-gray-900">
                        {/* {item.itemStatus} */}
                         <StatusBadge status={item.itemStatus} />
                      </span>
                    </div>
                    <div className="text-right min-w-20">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider md:hidden mb-1">
                        Action
                      </span>
                      <button
                        onClick={() => handleCancelItem(item._id)}
                        disabled={cancelOrderItemMutation.isPending || order.status == 'Cancelled' || item.itemStatus == "Cancelled"}
                        className="text-red-500 text-xs font-bold hover:underline disabled:text-gray-400 disabled:no-underline"
                      >
                        {" "}
                        {cancelOrderItemMutation.isPending &&
                        cancelOrderItemMutation.variables.itemId == item._id
                          ? "Cancelling..."
                          : "Cancel Item"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Address & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery / Pickup Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-emerald-600">
              <MapPin size={20} />
              <h3 className="font-bold text-gray-900">
                {isPickupMode ? "Pickup Location" : "Delivery Address"}
              </h3>
            </div>
            <div className="pl-8">
              <h4 className="font-bold text-gray-900 text-sm mb-2">
                {order.pickupAddress.name}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                {order.pickupAddress.street}, <br />
                {order.pickupAddress.city}, {order.pickupAddress.state} -{" "}
                {order.pickupAddress.pincode}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                <span className="font-medium">{order.pickupAddress.phone}</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-emerald-600">
              <CreditCard size={20} />
              <h3 className="font-bold text-gray-900">
                {isPickupMode ? "Payout Summary" : "Order Summary"}
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Store Items</span>
                <span className="font-medium">
                  ₹{order.pricing.storeItems || 0}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Pickup Services</span>
                <span className="font-medium">
                  ₹{order.pricing.pickupServices || 0}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>{isPickupMode ? "Total Item Value" : "Subtotal"}</span>
                <span className="font-medium">
                  ₹{order.pricing.subtotal || 0}
                </span>
              </div>

              
              <div className="flex justify-between text-emerald-600">
                <span>Earnings</span>
                <span className="font-medium">
                  ₹-{order.pricing.earnings || 0}
                </span>
              </div>

              {/* Only show Platform Fee for Store orders if relevant, or keep generic */}
              {!isPickupMode && (
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee</span>
                  <span className="font-medium">
                    ₹{order.pricing.platformFee || 0}
                  </span>
                </div>
              )}

              {order.pricing.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span className="font-bold">
                    - ₹{order.pricing.couponDiscount}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-100 my-3"></div>

              <div className="flex justify-between items-center">
                <span className={`font-bold ${order.pricing.totalAmount<=0? "text-emerald-600":"text-gray-900"} `}>
                  {order.pricing.totalAmount<=0 ? "Total Payout" : "Total Amount"}
                </span>
                <span className={`text-xl font-extrabold ${order.pricing.totalAmount<=0? "text-emerald-600":"text-gray-900"}`}>
                  ₹{Math.abs(order.pricing.totalAmount || 0)}
                </span>
              </div>

              <div className="flex justify-end mt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  {isPickupMode
                    ? "To be paid via Wallet/Cash"
                    : `${order.pricing.totalAmount<=0 ? "Credited to" : "Paid via"} ${order.paymentMethod}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
            <Download size={18} />
            Download Invoice (PDF)
          </button>

          {/* Show Return Button ONLY for Store Orders that are Delivered */}
          {!isPickupMode && order.status === "Delivered" && (
            <button className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
              Return Order
            </button>
          )}
        </div>

        {/* Cancel Modal (Reused) */}
        {order && (
          <CancelOrderModal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            onConfirm={handleCancelOrder}
            orderId={order.orderId}
            isCancelling={isCancelling}
          />
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
