import React, { useState } from "react";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/axiosInstance";
import StatusBadge from "../../user/profile/myOrders/components/StatusBadge";
import toast from "react-hot-toast";

const AdminOrderDetails = ({ mode = "order" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isPickupMode = mode === "pickup";
  const itemLabel = isPickupMode ? "Pickup" : "Order";

  const { data: order, isLoading } = useQuery({
    queryKey: ["adminorders", id],
    queryFn: async () => {
      const res = await api.get(`/admin/order/orders/${id}`);
      return res.data.order;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ newStatus, isReturn }) => {
      const payload = { status: newStatus };
      if (isPickupMode) {
        payload.type = "pickup";
      }

      const endpoint = isReturn
        ? `/admin/order/orders/${id}/return/status`
        : `/admin/order/orders/${id}/status`;

      const res = await api.put(endpoint, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminorders", id] });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Failed to update order status",
      );
    },
  });

  const handleUpdateStatus = (newStatus, isReturn = false) => {
    updateStatusMutation.mutate({ newStatus, isReturn });
  };

  const updateItemReturnMutation = useMutation({
    mutationFn: async ({ itemId, status }) => {
      const res = await api.put(`/admin/order/orders/${id}/item/${itemId}/return-status`, { status });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Item return status updated!");
      queryClient.invalidateQueries({ queryKey: ["adminorders", id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update item return");
    },
  });

  const handleItemReturn = (itemId, status) => {
    updateItemReturnMutation.mutate({ itemId, status });
  };
 

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-emerald-500 font-semibold">
        Loading Details...
      </div>
    );
  }

  const displayItems = order?.items.filter((item) => {
    const type = item.productId?.type;
    return isPickupMode
      ? type === "recyclable" || type === "junk"
      : type === "store";
  });

  const isAllContextItemsCancelled =
    displayItems.length > 0 &&
    displayItems.every((item) => item.itemStatus === "Cancelled");

  return (
    <div className="p-4  bg-gray-50 h-[calc(100vh-60px)] overflow-y-auto pb-24 font-sans">
      {isAllContextItemsCancelled && order.status !== "Cancelled" && (
        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 border border-yellow-200">
          <AlertCircle size={18} />
          All {isPickupMode ? "pickup" : "store"} items in this request are
          cancelled, but the overall order #{order.orderId} is still "
          {order.status}" because it contains other active items.
        </div>
      )}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 bg-white rounded-full transition-colors border border-gray-200 shadow-sm"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {itemLabel} Details
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              ID: <span className="text-slate-700 font-bold">{order._id}</span>
            </p>
          </div>
        </div>
        <StatusBadge
          status={
            isAllContextItemsCancelled
              ? "Cancelled"
              : isPickupMode
                ? order.pickupStatus
                : order.status
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
              <Package className="text-emerald-500" size={20} />
              <h2 className="text-lg font-bold text-gray-800">
                Items (
                {!isLoading
                  ? order.items.filter((item) => {
                      const type = item.productId?.type;
                      return isPickupMode
                        ? type === "earn" || type === "recyclable"
                        : type === "store";
                    }).length
                  : 0}
                )
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {!isLoading &&
                  order.items
                    .filter((item) => {
                      const type = item.productId?.type;
                      return isPickupMode
                        ? type === "junk" || type === "recyclable"
                        : type === "store";
                    })
                    .map((item, index) => (
                      <div
                        key={item.productId?._id || index}
                        className={`flex flex-col p-4 border rounded-2xl transition-colors ${
                          item.itemStatus === "Cancelled" 
                            ? "opacity-50 border-red-200 bg-red-50/20" 
                            : item.itemStatus === "Pending"
                              ? "border-orange-200 hover:border-orange-300 bg-white"
                              : "border-gray-100 hover:border-emerald-100 bg-gray-50/30"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 overflow-hidden shrink-0 mt-1">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-slate-800 truncate">
                                    {item.name}
                                  </h4>
                                  {item.itemStatus === "Cancelled" && (
                                    <>
                                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">
                                        Cancelled
                                      </span>
                                      {item.cancellationReason && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">
                                          Reason: {item.cancellationReason}
                                        </span>
                                      )}
                                    </>
                                  )}
                                  {item.itemStatus === "Returned" && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-600 rounded-full border border-purple-200">
                                      Returned (Approved)
                                    </span>
                                  )}
                                </div>
                                
                                {item.selectionName && (
                                  <p className="text-xs text-gray-500 mt-0.5 capitalize">
                                    {item.selectionType}: {item.selectionName}
                                  </p>
                                )}
                                <p className="text-sm font-semibold text-emerald-600 mt-1">
                                  ₹{item.price.toLocaleString("en-IN")} x{" "}
                                  {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`font-extrabold text-slate-800 ${item.itemStatus === "Cancelled" ? "line-through text-gray-400" : ""}`}
                                >
                                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* --- NEW: Beautiful Full-Width Pending Banner --- */}
                        {item.itemStatus === "Return Pending" && (
                          <div className="mt-4 p-4 bg-orange-50/80 border border-orange-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm w-full">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <AlertCircle size={18} className="text-orange-600 shrink-0" />
                                <span className="text-sm font-extrabold text-orange-800">
                                  Action Required: Return Requested
                                </span>
                              </div>
                              <p className="text-xs text-orange-700 font-medium">
                                <span className="uppercase text-[10px] tracking-wider font-bold mr-2 text-orange-500">
                                  Reason
                                </span>
                                "{item.returnReason || "No reason provided by the user"}"
                              </p>
                            </div>
                            
                            <div className="flex gap-3 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                              <button 
                                onClick={() => handleItemReturn(item._id, "Active")}
                                className="flex-1 md:flex-none px-5 py-2.5 bg-white text-slate-700 hover:bg-red-50 hover:text-red-700 border border-slate-200 text-xs font-bold rounded-lg transition-all shadow-sm focus:ring-2 focus:ring-orange-100 whitespace-nowrap"
                              >
                                Reject Return
                              </button>
                              <button 
                                onClick={() => handleItemReturn(item._id, "Returned")}
                                className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-orange-200 focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
                              >
                                Approve Return
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Admin Verification Images (If Pickup) */}
                        {isPickupMode &&
                          item.userUploadedImages &&
                          item.userUploadedImages.length > 0 && (
                            <div className="mt-2 pt-3 border-t border-gray-100 w-full">
                              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                                Admin Verification Images
                              </p>
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {item.userUploadedImages.map((img, i) => (
                                  <a
                                    href={img}
                                    target="_blank"
                                    rel="noreferrer"
                                    key={i}
                                  >
                                    <img
                                      src={img}
                                      alt="User Upload"
                                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer shadow-sm"
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
              <CreditCard className="text-indigo-500" size={20} />
              <h2 className="text-lg font-bold text-gray-800">
                Payment Summary
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3 text-sm font-medium text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Store Items</span>
                  <span className="text-slate-700 font-bold">
                    ₹{(order.pricing?.storeItems || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pickup Services</span>
                  <span className="text-slate-700 font-bold">
                    ₹{(order.pricing?.pickupServices || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-slate-700 font-bold">
                    ₹{(order.pricing?.subtotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-600">Earnings</span>
                  <span className="text-emerald-600 font-bold">
                    ₹-{(order.pricing?.earnings || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Platform Fee</span>
                  <span className="text-slate-700 font-bold">
                    ₹{(order.pricing?.platformFee || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                {order.pricing.couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>Discount</span>
                    <span>
                      - ₹{order.pricing?.couponDiscount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">
                    Total Amount ({order.paymentMethod})
                  </span>
                  <span className="text-xl font-extrabold text-indigo-600 shadow-sm">
                    ₹{(order.pricing?.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 text-xs">
                  <span>
                    Status:{" "}
                    <strong
                      className={
                        order.paymentStatus === "Completed"
                          ? "text-emerald-500"
                          : "text-orange-500"
                      }
                    >
                      {order.paymentStatus}
                    </strong>
                  </span>
                  {order.transactionId && (
                    <span>Txn ID: {order.transactionId}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {!isPickupMode && order.return?.timestamp && (
            <div
              className={`bg-white rounded-3xl shadow-sm  overflow-hidden border-t-4 ${
                order.return.status === "Pending"
                  ? "border-t-orange-500"
                  : order.return.status === "Approved"
                    ? "border-t-blue-500"
                    : order.return.status === "Completed"
                      ? "border-t-purple-500"
                      : "border-t-red-500"
              }`}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle
                    className={
                      order.return.status === "Pending"
                        ? "text-orange-500"
                        : "text-blue-500"
                    }
                    size={20}
                  />
                  <h2 className="text-lg font-bold text-gray-800">
                    Return: {order.return.status}
                  </h2>
                </div>

                <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium">
                  <span className="text-gray-400 font-bold uppercase text-xs block mb-1">
                    Customer Reason
                  </span>
                  "{order.return.reason || "No reason provided"}"
                </p>

                {order.return.status === "Pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateStatus("Approved", true)}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-200 text-sm"
                    >
                      Approve Return
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("Rejected", true)}
                      className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all border border-red-100 text-sm"
                    >
                      Reject Return
                    </button>
                  </div>
                )}

                {order.return.status === "Approved" && (
                  <button
                    onClick={() => handleUpdateStatus("Completed", true)}
                    className="w-full py-2.5 mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle2 size={18} /> Mark Items Received & Refunded
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden border-t-4 border-t-emerald-500">
            <div className="px-6 py-5 border-b border-gray-50 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-gray-800">Update Status</h2>
              <p className="text-xs text-gray-500 mt-1">
                Manage this {itemLabel.toLowerCase()}'s lifecycle
              </p>
            </div>
            <div className="p-6 space-y-3">
              {!isAllContextItemsCancelled &&
                (isPickupMode
                  ? order.pickupStatus === "Pending"
                  : order.status === "Placed") && (
                  <>
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          isPickupMode ? "Agent Assigned" : "Confirmed",
                        )
                      }
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} /> Accept {itemLabel}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("Cancelled")}
                      className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all active:scale-95 border border-red-100 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Cancel {itemLabel}
                    </button>
                  </>
                )}
              {!isAllContextItemsCancelled &&
                (isPickupMode
                  ? order.pickupStatus === "Agent Assigned"
                  : order.status === "Confirmed") && (
                  <>
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          isPickupMode ? "Out for Pickup" : "Shipped",
                        )
                      }
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                    >
                      <>
                        <Truck size={18} />
                        {isPickupMode
                          ? "Mark as Out for delivery"
                          : "Mark as Shipped"}
                      </>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("Cancelled")}
                      className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all active:scale-95 border border-red-100"
                    >
                      Cancel {itemLabel}
                    </button>
                  </>
                )}
              {!isAllContextItemsCancelled &&
                (isPickupMode
                  ? order.pickupStatus === "Out for Pickup"
                  : order.status === "Shipped") && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        isPickupMode ? "Completed" : "Delivered",
                      )
                    }
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />{" "}
                    {isPickupMode ? "Mark as Completed" : "Mark as Delivered"}
                  </button>
                )}

              {(() => {
                const currentStatus = isPickupMode ? order.pickupStatus : order.status;
                const isFinished = ["Delivered", "Completed", "Cancelled", "Returned"].includes(currentStatus);
                if (isFinished || isAllContextItemsCancelled) {
                  return (
                    <div
                      className={`w-full py-3 rounded-xl border text-center font-bold text-sm ${
                        (currentStatus === "Delivered" || currentStatus === "Completed") && !isAllContextItemsCancelled
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-red-50 text-red-600 border-red-100"
                      }`}
                    >
                      This {itemLabel.toLowerCase()} is{" "}
                      {isAllContextItemsCancelled ? "Cancelled" : currentStatus}
                    </div>
                  );
                }
                return null;
              })()}

              {(isAllContextItemsCancelled || order.status === "Cancelled") && (
                <div className="flex justify-center mt-2">
                  {order.cancellation?.cancelledBy ||
                  (isAllContextItemsCancelled &&
                    order.status !== "Cancelled") ? (
                    <span className="text-[11px] font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                      Customer Cancelled {order.cancellation?.reason}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                      Cancelled By Admin
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-2">
              <User className="text-blue-500" size={18} />
              <h2 className="text-base font-bold text-gray-800">
                Customer Details
              </h2>
            </div>
            <div className="pl-6 pb-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                    Name
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {order.userId.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                    <Mail size={14} />
                  </div>
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {order.userId.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                    <Phone size={14} />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {order.userId.phone || "No phone provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden">
            <div className="px-6 py-2 border-b border-gray-50 flex items-center gap-2">
              <MapPin className="text-orange-500" size={18} />
              <h2 className="text-base font-bold text-gray-800">
                Delivery Address
              </h2>
            </div>
            <div className="pl-6 pb-4">
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                {order.pickupAddress.street},<br />
                {order.pickupAddress.locality},<br />
                {order.pickupAddress.city}, {order.pickupAddress.state} -{" "}
                <span className="font-bold">{order.pickupAddress.pincode}</span>
              </p>

              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-3">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">Placed On</p>
                  <p className="text-sm font-bold text-slate-700">
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {isPickupMode && order.pickupDate && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 bg-indigo-50/50 -mx-6 px-6 py-4 rounded-b-3xl">
                  <Calendar size={20} className="text-indigo-500" />
                  <div>
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-0.5">
                      Scheduled Pickup
                    </p>
                    <p className="text-base font-extrabold text-indigo-900">
                      {new Date(order.pickupDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm font-semibold text-indigo-700 mt-0.5">
                      {order.pickupTimeSlot}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;




// import React, { useState } from "react";
// import {
//   ArrowLeft,
//   Package,
//   Truck,
//   CheckCircle2,
//   XCircle,
//   User,
//   MapPin,
//   CreditCard,
//   Calendar,
//   Phone,
//   Mail,
//   AlertCircle,
// } from "lucide-react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { api } from "../../../api/axiosInstance";
// import StatusBadge from "../../user/profile/myOrders/components/StatusBadge";
// import toast from "react-hot-toast";

// const AdminOrderDetails = ({ mode = "order" }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const isPickupMode = mode === "pickup";
//   const itemLabel = isPickupMode ? "Pickup" : "Order";

//   const { data: order, isLoading } = useQuery({
//     queryKey: ["adminorders", id],
//     queryFn: async () => {
//       const res = await api.get(`/admin/order/orders/${id}`);
//       return res.data.order;
//     },
//   });
//   console.log(order);
//   const updateStatusMutation = useMutation({
//     mutationFn: async ({ newStatus, isReturn }) => {
//       const payload = { status: newStatus };
//       if (isPickupMode) {
//         payload.type = "pickup";
//       }

//       const endpoint = isReturn
//         ? `/admin/order/orders/${id}/return/status`
//         : `/admin/order/orders/${id}/status`;

//       const res = await api.put(endpoint, payload);
//       return res.data;
//     },
//     onSuccess: (data) => {
//       toast.success(data.message || "Status updated successfully!");
//       queryClient.invalidateQueries({ queryKey: ["adminorders", id] });
//     },
//     onError: (err) => {
//       toast.error(
//         err.response?.data?.message || "Failed to update order status",
//       );
//     },
//   });
//   const handleUpdateStatus = (newStatus, isReturn = false) => {
//     updateStatusMutation.mutate({ newStatus, isReturn });
//   };

//   const updateItemReturnMutation = useMutation({
//     mutationFn: async ({ itemId, status }) => {
//       const res = await api.put(
//         `/admin/order/orders/${id}/item/${itemId}/return-status`,
//         { status },
//       );
//       return res.data;
//     },
//     onSuccess: (data) => {
//       toast.success(data.message || "Item return status updated!");
//       queryClient.invalidateQueries({ queryKey: ["adminorders", id] });
//     },
//     onError: (err) => {
//       toast.error(
//         err.response?.data?.message || "Failed to update item return",
//       );
//     },
//   });
//   const handleItemReturn = (itemId, status) => {
//     updateItemReturnMutation.mutate({ itemId, status });
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-50 text-emerald-500 font-semibold">
//         Loading Details...
//       </div>
//     );
//   }

//   const displayItems = order?.items.filter((item) => {
//     const type = item.productId?.type;
//     return isPickupMode
//       ? type === "recyclable" || type === "junk"
//       : type === "store";
//   });

//   const isAllContextItemsCancelled =
//     displayItems.length > 0 &&
//     displayItems.every((item) => item.itemStatus === "Cancelled");

//   <StatusBadge
//     status={isAllContextItemsCancelled ? "Cancelled" : order.status}
//   />;

//   //   {isAllContextItemsCancelled && order.status !== 'Cancelled' && (
//   //     <div className="bg-yellow-50 text-yellow-700 p-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 border border-yellow-200">
//   //         <AlertCircle size={18} />
//   //         All {isPickupMode ? 'pickup' : 'store'} items in this request are cancelled, but the overall order #{order.orderId} is still "{order.status}" because it contains other active items.
//   //     </div>
//   //   )}

//   return (
//     <div className="p-4  bg-gray-50 h-[calc(100vh-60px)] overflow-y-auto pb-24 font-sans">
//       {isAllContextItemsCancelled && order.status !== "Cancelled" && (
//         <div className="bg-yellow-50 text-yellow-700 p-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 border border-yellow-200">
//           <AlertCircle size={18} />
//           All {isPickupMode ? "pickup" : "store"} items in this request are
//           cancelled, but the overall order #{order.orderId} is still "
//           {order.status}" because it contains other active items.
//         </div>
//       )}
//       <div className="mb-6 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate(-1)}
//             className="p-2 hover:bg-gray-200 bg-white rounded-full transition-colors border border-gray-200 shadow-sm"
//           >
//             <ArrowLeft size={20} className="text-gray-600" />
//           </button>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               {itemLabel} Details
//             </h1>
//             <p className="text-sm text-gray-500 font-medium mt-1">
//               ID: <span className="text-slate-700 font-bold">{order._id}</span>
//             </p>
//           </div>
//         </div>
//         {/* <StatusBadge status={order.status} /> */}
//         <StatusBadge
//           status={
//             isAllContextItemsCancelled
//               ? "Cancelled"
//               : isPickupMode
//                 ? order.pickupStatus
//                 : order.status
//           }
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-6">
//           <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden">
//             <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
//               <Package className="text-emerald-500" size={20} />
//               <h2 className="text-lg font-bold text-gray-800">
//                 Items (
//                 {!isLoading
//                   ? order.items.filter((item) => {
//                       const type = item.productId?.type;
//                       return isPickupMode
//                         ? type === "earn" || type === "recyclable"
//                         : type === "store";
//                     }).length
//                   : 0}
//                 )
//               </h2>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">
//                 {!isLoading &&
//                   order.items
//                     .filter((item) => {
//                       const type = item.productId?.type;
//                       return isPickupMode
//                         ? type === "junk" || type === "recyclable"
//                         : type === "store";
//                     })
//                     .map((item, index) => (
//                       <div
//                         key={item.productId?._id || index}
//                         className={`flex flex-col gap-4 p-4 border border-gray-100 rounded-2xl hover:border-emerald-100 transition-colors  ${item.itemStatus === "Cancelled" ? "opacity-50 border-red-200 bg-red-50/20" : "border-gray-100 hover:border-emerald-100 bg-gray-50/30"}`}
//                       >
//                         <div className="flex items-start gap-4">
//                           <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 overflow-hidden shrink-0 mt-1">
//                             <img
//                               src={item.image}
//                               alt={item.name}
//                               className="w-full h-full object-cover"
//                             />
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="flex justify-between items-start">
//                               <div>
//                                 <div className="flex items-center gap-2">
//                                   <h4 className="font-bold text-slate-800 truncate">
//                                     {item.name}
//                                   </h4>
//                                   {item.itemStatus === "Cancelled" && (
//                                     <>
//                                       <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">
//                                         Cancelled
//                                       </span>
//                                       <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">
//                                         Reason:{item.cancellationReason}
//                                       </span>
//                                     </>
//                                   )}
//                                   {item.itemStatus === "Return Pending" && (
//                                     <div className="flex flex-col gap-2 ml-2">
//                                       <div className="flex items-center gap-2">
//                                         <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-600 rounded-full border border-orange-200">
//                                           Return Pending
//                                         </span>
//                                         <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-50 text-orange-600 rounded-full border border-orange-100">
//                                           Reason: {item.returnReason}
//                                         </span>
//                                       </div>
//                                       <div className="flex gap-2">
//                                         <button
//                                           onClick={() =>
//                                             handleItemReturn(
//                                               item._id,
//                                               "Returned",
//                                             )
//                                           }
//                                           className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold rounded-md shadow-sm transition-colors"
//                                         >
//                                           Approve
//                                         </button>
//                                         <button
//                                           onClick={() =>
//                                             handleItemReturn(item._id, "Active")
//                                           }
//                                           className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] font-bold rounded-md transition-colors"
//                                         >
//                                           Reject
//                                         </button>
//                                       </div>
//                                     </div>
//                                   )}
//                                   {item.itemStatus === "Returned" && (
//                                     <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-600 rounded-full border border-purple-200 ml-2">
//                                       Returned (Approved)
//                                     </span>
//                                   )}
//                                 </div>
//                                 {/* <h4 className="font-bold text-slate-800 truncate">{item.name}</h4> */}
//                                 {item.selectionName && (
//                                   <p className="text-xs text-gray-500 mt-0.5 capitalize">
//                                     {item.selectionType}: {item.selectionName}
//                                   </p>
//                                 )}
//                                 <p className="text-sm font-semibold text-emerald-600 mt-1">
//                                   ₹{item.price.toLocaleString("en-IN")} x{" "}
//                                   {item.quantity}
//                                 </p>
//                               </div>
//                               <div className="text-right">
//                                 <p
//                                   className={`font-extrabold text-slate-800 ${item.itemStatus === "Cancelled" ? "line-through text-gray-400" : ""}`}
//                                 >
//                                   ₹
//                                   {(item.price * item.quantity).toLocaleString(
//                                     "en-IN",
//                                   )}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                         {isPickupMode &&
//                           item.userUploadedImages &&
//                           item.userUploadedImages.length > 0 && (
//                             <div className="mt-1 pt-3 border-t border-gray-100 w-full">
//                               <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
//                                 Admin Verification Images
//                               </p>
//                               <div className="flex gap-2 overflow-x-auto pb-2">
//                                 {item.userUploadedImages.map((img, i) => (
//                                   <a
//                                     href={img}
//                                     target="_blank"
//                                     rel="noreferrer"
//                                     key={i}
//                                   >
//                                     <img
//                                       src={img}
//                                       alt="User Upload"
//                                       className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer shadow-sm"
//                                     />
//                                   </a>
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                       </div>
//                     ))}
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden">
//             <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
//               <CreditCard className="text-indigo-500" size={20} />
//               <h2 className="text-lg font-bold text-gray-800">
//                 Payment Summary
//               </h2>
//             </div>
//             <div className="p-6">
//               <div className="space-y-3 text-sm font-medium text-gray-500">
//                 <div className="flex justify-between items-center">
//                   <span>Store Items</span>
//                   <span className="text-slate-700 font-bold">
//                     ₹{(order.pricing?.storeItems || 0).toLocaleString("en-IN")}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Pickup Services</span>
//                   <span className="text-slate-700 font-bold">
//                     ₹
//                     {(order.pricing?.pickupServices || 0).toLocaleString(
//                       "en-IN",
//                     )}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Subtotal</span>
//                   <span className="text-slate-700 font-bold">
//                     ₹{(order.pricing?.subtotal || 0).toLocaleString("en-IN")}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-emerald-600">Earnings</span>
//                   <span className="text-emerald-600 font-bold">
//                     ₹-{(order.pricing?.earnings || 0).toLocaleString("en-IN")}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Platform Fee</span>
//                   <span className="text-slate-700 font-bold">
//                     ₹{(order.pricing?.platformFee || 0).toLocaleString("en-IN")}
//                   </span>
//                 </div>
//                 {order.pricing.couponDiscount > 0 && (
//                   <div className="flex justify-between items-center text-emerald-600">
//                     <span>Discount</span>
//                     <span>
//                       - ₹{order.pricing?.couponDiscount.toLocaleString("en-IN")}
//                     </span>
//                   </div>
//                 )}
//                 <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
//                   <span className="text-base font-bold text-gray-900">
//                     Total Amount ({order.paymentMethod})
//                   </span>
//                   <span className="text-xl font-extrabold text-indigo-600 shadow-sm">
//                     ₹{(order.pricing?.totalAmount || 0).toLocaleString("en-IN")}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center mt-2 pt-2 text-xs">
//                   <span>
//                     Status:{" "}
//                     <strong
//                       className={
//                         order.paymentStatus === "Completed"
//                           ? "text-emerald-500"
//                           : "text-orange-500"
//                       }
//                     >
//                       {order.paymentStatus}
//                     </strong>
//                   </span>
//                   {order.transactionId && (
//                     <span>Txn ID: {order.transactionId}</span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-6">
//           {!isPickupMode && order.return?.timestamp && (
//             <div
//               className={`bg-white rounded-3xl shadow-sm  overflow-hidden border-t-4 ${
//                 order.return.status === "Pending"
//                   ? "border-t-orange-500"
//                   : order.return.status === "Approved"
//                     ? "border-t-blue-500"
//                     : order.return.status === "Completed"
//                       ? "border-t-purple-500"
//                       : "border-t-red-500"
//               }`}
//             >
//               <div className="p-6">
//                 <div className="flex items-center gap-2 mb-3">
//                   <AlertCircle
//                     className={
//                       order.return.status === "Pending"
//                         ? "text-orange-500"
//                         : "text-blue-500"
//                     }
//                     size={20}
//                   />
//                   <h2 className="text-lg font-bold text-gray-800">
//                     Return: {order.return.status}
//                   </h2>
//                 </div>

//                 <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium">
//                   <span className="text-gray-400 font-bold uppercase text-xs block mb-1">
//                     Customer Reason
//                   </span>
//                   "{order.return.reason || "No reason provided"}"
//                 </p>

//                 {order.return.status === "Pending" && (
//                   <div className="flex gap-3">
//                     <button
//                       onClick={() => handleUpdateStatus("Approved", true)}
//                       className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-200 text-sm"
//                     >
//                       Approve Return
//                     </button>
//                     <button
//                       onClick={() => handleUpdateStatus("Rejected", true)}
//                       className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all border border-red-100 text-sm"
//                     >
//                       Reject Return
//                     </button>
//                   </div>
//                 )}

//                 {order.return.status === "Approved" && (
//                   <button
//                     onClick={() => handleUpdateStatus("Completed", true)}
//                     className="w-full py-2.5 mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-2 text-sm"
//                   >
//                     <CheckCircle2 size={18} /> Mark Items Received & Refunded
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}
//           <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden border-t-4 border-t-emerald-500">
//             <div className="px-6 py-5 border-b border-gray-50 backdrop-blur-sm">
//               <h2 className="text-lg font-bold text-gray-800">Update Status</h2>
//               <p className="text-xs text-gray-500 mt-1">
//                 Manage this {itemLabel.toLowerCase()}'s lifecycle
//               </p>
//             </div>
//             <div className="p-6 space-y-3">
//               {!isAllContextItemsCancelled &&
//                 (isPickupMode
//                   ? order.pickupStatus === "Pending"
//                   : order.status === "Placed") && (
//                   <>
//                     <button
//                       onClick={() =>
//                         handleUpdateStatus(
//                           isPickupMode ? "Agent Assigned" : "Confirmed",
//                         )
//                       }
//                       className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
//                     >
//                       <CheckCircle2 size={18} /> Accept {itemLabel}
//                     </button>
//                     <button
//                       onClick={() => handleUpdateStatus("Cancelled")}
//                       className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all active:scale-95 border border-red-100 flex items-center justify-center gap-2"
//                     >
//                       <XCircle size={18} /> Cancel {itemLabel}
//                     </button>
//                   </>
//                 )}
//               {!isAllContextItemsCancelled &&
//                 (isPickupMode
//                   ? order.pickupStatus === "Agent Assigned"
//                   : order.status === "Confirmed") && (
//                   <>
//                     <button
//                       onClick={() =>
//                         handleUpdateStatus(
//                           isPickupMode ? "Out for Pickup" : "Shipped",
//                         )
//                       }
//                       className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-blue-200 flex items-center justify-center gap-2"
//                     >
//                       <>
//                         <Truck size={18} />
//                         {isPickupMode
//                           ? "Mark as Out for delivery"
//                           : "Mark as Shipped"}
//                       </>
//                     </button>
//                     <button
//                       onClick={() => handleUpdateStatus("Cancelled")}
//                       className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all active:scale-95 border border-red-100"
//                     >
//                       Cancel {itemLabel}
//                     </button>
//                   </>
//                 )}
//               {!isAllContextItemsCancelled &&
//                 (isPickupMode
//                   ? order.pickupStatus === "Out for Pickup"
//                   : order.status === "Shipped") && (
//                   <button
//                     onClick={() =>
//                       handleUpdateStatus(
//                         isPickupMode ? "Completed" : "Delivered",
//                       )
//                     }
//                     className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
//                   >
//                     <CheckCircle2 size={18} />{" "}
//                     {isPickupMode ? "Mark as Completed" : "Mark as Delivered"}
//                   </button>
//                 )}

//               {(["Delivered", "Completed", "Cancelled", "Returned"].includes(
//                 order.status,
//               ) ||
//                 isAllContextItemsCancelled) && (
//                 <div
//                   className={`w-full py-3 rounded-xl border text-center font-bold text-sm ${
//                     (order.status === "Delivered" ||
//                       order.status === "Completed") &&
//                     !isAllContextItemsCancelled
//                       ? "bg-emerald-50 text-emerald-600 border-emerald-100"
//                       : "bg-red-50 text-red-600 border-red-100"
//                   }`}
//                 >
//                   This {itemLabel.toLowerCase()} is{" "}
//                   {isAllContextItemsCancelled ? "Cancelled" : order.status}
//                 </div>
//               )}

//               {(isAllContextItemsCancelled || order.status === "Cancelled") && (
//                 <div className="flex justify-center mt-2">
//                   {order.cancellation?.cancelledBy ||
//                   (isAllContextItemsCancelled &&
//                     order.status !== "Cancelled") ? (
//                     <span className="text-[11px] font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full border border-red-200">
//                       Customer Cancelled {order.cancellation?.reason}
//                     </span>
//                   ) : (
//                     <span className="text-[11px] font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
//                       Cancelled By Admin
//                     </span>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden">
//             <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-2">
//               <User className="text-blue-500" size={18} />
//               <h2 className="text-base font-bold text-gray-800">
//                 Customer Details
//               </h2>
//             </div>
//             <div className="pl-6 pb-4">
//               <div className="space-y-2">
//                 <div>
//                   <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
//                     Name
//                   </p>
//                   <p className="text-sm font-bold text-slate-800">
//                     {order.userId.name}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
//                     <Mail size={14} />
//                   </div>
//                   <p className="text-sm font-medium text-slate-700 truncate">
//                     {order.userId.email}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
//                     <Phone size={14} />
//                   </div>
//                   <p className="text-sm font-medium text-slate-700">
//                     {order.userId.phone || "No phone provided"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden">
//             <div className="px-6 py-2 border-b border-gray-50 flex items-center gap-2">
//               <MapPin className="text-orange-500" size={18} />
//               <h2 className="text-base font-bold text-gray-800">
//                 Delivery Address
//               </h2>
//             </div>
//             <div className="pl-6 pb-4">
//               <p className="text-sm font-medium text-slate-700 leading-relaxed">
//                 {order.pickupAddress.street},<br />
//                 {order.pickupAddress.locality},<br />
//                 {order.pickupAddress.city}, {order.pickupAddress.state} -{" "}
//                 <span className="font-bold">{order.pickupAddress.pincode}</span>
//               </p>

//               <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-3">
//                 <Calendar size={16} className="text-gray-400" />
//                 <div>
//                   <p className="text-xs text-gray-400 font-medium">Placed On</p>
//                   <p className="text-sm font-bold text-slate-700">
//                     {new Date(order.createdAt).toLocaleDateString()} at{" "}
//                     {new Date(order.createdAt).toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </p>
//                 </div>
//               </div>

//               {isPickupMode && order.pickupDate && (
//                 <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 bg-indigo-50/50 -mx-6 px-6 py-4 rounded-b-3xl">
//                   <Calendar size={20} className="text-indigo-500" />
//                   <div>
//                     <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-0.5">
//                       Scheduled Pickup
//                     </p>
//                     <p className="text-base font-extrabold text-indigo-900">
//                       {new Date(order.pickupDate).toLocaleDateString("en-US", {
//                         weekday: "long",
//                         year: "numeric",
//                         month: "long",
//                         day: "numeric",
//                       })}
//                     </p>
//                     <p className="text-sm font-semibold text-indigo-700 mt-0.5">
//                       {order.pickupTimeSlot}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminOrderDetails;
