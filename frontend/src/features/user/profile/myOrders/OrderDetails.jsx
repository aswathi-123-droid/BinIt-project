import React, { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../api/axiosInstance";
import { generateInvoice } from "../../../../utils/generateInvoice";
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
  Calendar,
} from "lucide-react";
import StatusBadge from "./components/StatusBadge";
import CancelOrderModal from "./components/CancelOrderModal";
import toast from "react-hot-toast";
import ReturnOrderModal from "./components/returnOrderModal";

const OrderDetails = () => {
  const { orderId } = useParams();
  const location = useLocation();

  // const isPickupMode = location.pathname.includes("/pickup/");

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [cancellingItemId, setCancellingItemId] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [returningItemId, setReturningItemId] = useState(null);
  const [isPickupMode, setIsPickupMode] = useState(false)

  const queryClient = useQueryClient();

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

  const handleCancelOrder = async (reason) => {
    setIsCancelling(true);

    try {
      if (cancellingItemId) {
        await api.put(
          `/order/${encodeURIComponent(order.orderId)}/item/${cancellingItemId}/cancel`,
          {
            reason: reason,
            isPickupMode: isPickupMode
          },
        );
        toast.success("Item cancelled successfully");
      } else {
        await api.post(`/order/${encodeURIComponent(order.orderId)}/cancel`, {
          reason: reason,
          isPickupMode: isPickupMode
        });
        toast.success(
          isPickupMode
            ? "Pickup cancelled successfully"
            : "Order cancelled successfully",
        );
      }
      queryClient.invalidateQueries(["order", order.orderId]);
      setIsCancelModalOpen(false);
      setCancellingItemId(null);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to cancel some items. Please try again.";
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReturnOrder = async (payload) => {
    setIsReturning(true);
    try {
      if (returningItemId) {
        await api.put(
          `/order/${encodeURIComponent(order.orderId)}/item/${returningItemId}/return`,
          {
            reason: payload.reason,
          },
        );
        toast.success("Item return requested successfully");
      } else {
        await api.post(`/order/${encodeURIComponent(order.orderId)}/return`, {
          reason: payload.reason,
        });
        toast.success("Order return requested successfully");
      }

      queryClient.invalidateQueries(["order", order.orderId]);
      setIsReturnModalOpen(false);
      setReturningItemId(null);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to submit return request";
      toast.error(message);
    } finally {
      setIsReturning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans animate-pulse">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="h-4 w-48 bg-gray-200 rounded-md mb-3"></div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-64 bg-gray-300 rounded-lg"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="h-5 w-40 bg-gray-300 rounded-md mb-8"></div>
            <div className="flex items-center justify-between mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded-md"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 flex justify-between">
              <div className="h-5 w-40 bg-gray-300 rounded-md"></div>
            </div>

            <div className="divide-y divide-gray-50">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-lg bg-gray-200"></div>
                  <div className="flex-1 w-full space-y-2">
                    <div className="h-4 w-3/4 bg-gray-300 rounded-md"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded-md"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
  
  const originalPaidAmount = (order.pricing.amountToPayOnline || 0) + (order.pricing.walletAmountUsed || 0);
  const isCOD = order.paymentMethod === "COD";
  const isDelivered = ["Delivered", "Completed", "Returned"].includes(order.status);
  
  const actuallyPaid = (isCOD && !isDelivered) ? 0 : originalPaidAmount;
  const amountDue = order.pricing.totalAmount - actuallyPaid;

  const orderItems = order.items.filter((item) => item.productId?.type === "store");
  const pickupItems = order.items.filter((item) => item.productId?.type !== "store");

  const orderTimelineSteps = [
    { label: "Order Placed", date: order.createdAt, status: "Placed" },
    { label: "Order Confirmed", date: order.createdAt, status: "Confirmed" },
    { label: "Shipped", date: null, status: "Shipped" },
    { label: "Delivered", date: null, status: "Delivered" },
  ];
  const orderStatusOrder = ["Placed", "Confirmed", "Shipped", "Delivered"];
  const currentOrderStatusIndex = orderStatusOrder.indexOf(order.status);

  const pickupTimelineSteps = [
    { label: "Request Placed", date: order.createdAt, status: "Pending" },
    { label: "Agent Assigned", date: order.createdAt, status: "Agent Assigned" },
    { label: "Out for Pickup", date: null, status: "Out for Pickup" },
    { label: "Pickup Completed", date: null, status: "Completed" },
  ];
  const pickupStatusOrder = ["Pending", "Agent Assigned", "Out for Pickup", "Completed"];
  const currentPickupStatusIndex = pickupStatusOrder.indexOf(order.pickupStatus);

  const isAllitemCancelled = order.items.every(
    (item) => item.itemStatus === "Cancelled" || item.itemStatus === "Returned"
  );
  

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* === HEADER SECTION === */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link to="/" className="hover:text-emerald-600">Home</Link> /
              <Link to="/profile/my-orders" className="hover:text-emerald-600"> My Orders</Link> /
              <span className="text-gray-900 font-medium">{order.orderId}</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Order Details <span className="text-gray-400 font-medium text-xl">{order.orderId}</span>
              </h1>
              {/* <StatusBadge
                status={
                  (currentCancellation?.status === 'Pending' && currentCancellation?.timestamp)
                    ? "Cancel Pending" 
                    : (isPickupMode ? order.pickupStatus : order.status)
                }
              /> */}
              {!isPickupMode && order.return?.timestamp && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.return.status === "Pending" ? "bg-orange-50 text-orange-600 border-orange-200" : order.return.status === "Approved" ? "bg-blue-50 text-blue-600 border-blue-200" : order.return.status === "Completed" ? "bg-purple-50 text-purple-600 border-purple-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                  Return {order.return.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {!isPickupMode && order.return?.timestamp && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${order.return.status === "Completed" ? "bg-purple-50 border-purple-100 text-purple-800" : "bg-blue-50 border-blue-100 text-blue-800"}`}>
            <AlertCircle size={20} className={`shrink-0 mt-0.5 ${order.return.status === "Completed" ? "text-purple-600" : "text-blue-600"}`} />
            <div>
              <h4 className="font-bold text-sm">Return Request {order.return.status}</h4>
              <p className="text-xs mt-1 opacity-90">
                {order.return.status === "Pending" && "Your return request has been submitted. Our team will review it shortly."}
                {order.return.status === "Approved" && "Your return is approved! A delivery partner will contact you soon."}
                {order.return.status === "Rejected" && "Unfortunately, your return request was not approved."}
                {order.return.status === "Completed" && "Your items have been returned successfully. Refund is being processed."}
              </p>
            </div>
          </div>
        )}

        {orderItems.length > 0 && (
          <div className="space-y-4 mb-10">
            
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm overflow-x-auto">
              <h3 className="font-bold text-gray-900 mb-8">Delivery Timeline</h3>
              <div className="flex items-center justify-between min-w-150 relative mt-4 mb-4">
                <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 z-0"></div>
                <div
                  className="absolute top-4 left-0 h-1 bg-emerald-500 z-0 transition-all duration-500"
                  style={{ width: `${(currentOrderStatusIndex / (orderStatusOrder.length - 1)) * 100}%` }}
                ></div>

                {orderTimelineSteps.map((step, index) => {
                  const isCompleted = index <= currentOrderStatusIndex;
                  return (
                    <div key={index} className="flex flex-col items-center gap-3 relative z-10 group">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110" : "bg-white border-2 border-gray-200 text-gray-300"}`}>
                        {isCompleted ? <CheckCircle size={16} strokeWidth={3} /> : <Clock size={16} />}
                      </div>
                      <div className="text-center bg-white px-2 mt-1">
                        <p className={`text-sm font-bold ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                        {step.date && isCompleted && (
                          <p className="text-[10px] text-gray-400 font-medium mt-1">
                            {new Date(step.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold text-gray-900">Delivery Items</h3>
                {!["Cancelled", "Shipped", "Delivered", "Returned"].includes(order.status) && !isAllitemCancelled  && (
                  <button className="text-red-500 text-xs font-bold hover:underline" onClick={() => setIsCancelModalOpen(true)}>Cancel Order</button>
                )}
              </div>
              <div className="hidden sm:flex items-center px-2 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                <div className="flex-1 pl-4 text-left">Product</div>
                <div className="flex items-center justify-between gap-12 text-sm w-auto">
                  <div className="text-center w-15">Qty</div>
                  <div className="text-center w-20">Unit Price</div>
                  <div className="text-center w-20">Total</div>
                  <div className="text-center w-20">Status</div>
                  <div className="text-center w-20">Action</div>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {orderItems.map((item, idx) => {
                  const imgSrc = item.image || (item.productId?.image && item.productId.image[0]);
                  return (
                    <div key={idx} className="p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50/50">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {imgSrc ? <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" /> : <Package className="text-gray-300" />}
                      </div>
                      <div className="flex-1 w-full text-center sm:text-left">
                         <h4 className="font-bold text-gray-900 text-sm mb-1">{item.name}</h4>
                         <p className="text-xs text-gray-500">Store Item</p>
                      </div>
                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-12 text-sm">
                         <div className="text-center w-15"><span className="font-bold text-gray-700">{item.quantity}</span></div>
                         <div className="text-center w-20"><span className="font-medium text-gray-900">₹{item.productId.price}</span></div>
                         <div className="text-right min-w-20"><span className="font-bold text-gray-900">₹{item.price}</span></div>
                         <div className="text-right min-w-20"><StatusBadge status={item.itemStatus} /></div>
                         <div className="text-right min-w-20">
                           {order.status === "Delivered" ? (
                              <button onClick={() => { setReturningItemId(item._id); setIsReturnModalOpen(true); }} disabled={item.itemStatus === "Returned" || item.itemStatus === "Cancelled" || item.itemStatus === "Return Pending"} className="text-blue-500 text-xs font-bold hover:underline disabled:text-gray-400 disabled:no-underline">Return</button>
                            ) : (
                              <button onClick={() => { setCancellingItemId(item._id); setIsCancelModalOpen(true); }} disabled={["Cancelled", "Shipped", "Returned"].includes(order.status) || item.itemStatus === "Cancelled"} className="text-red-500 text-xs font-bold hover:underline disabled:text-gray-400 disabled:no-underline">Cancel</button>
                            )}
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {pickupItems.length > 0 && (
          <div className="space-y-4 mb-10 mt-8">
            {order.pickupDate && (
                <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-full shadow-sm text-blue-600"><Calendar size={24} /></div>
                    <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide opacity-80 mb-1">Scheduled Pickup Time</p>
                    <h3 className="text-lg font-bold text-gray-900">
                        {new Date(order.pickupDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        <span className="mx-2 text-gray-400">•</span>{order.pickupTimeSlot}
                    </h3>
                    </div>
                </div>
                </div>
            )}


            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm overflow-x-auto">
              <h3 className="font-bold text-gray-900 mb-8">Pickup Timeline</h3>
              <div className="flex items-center justify-between min-w-150 relative mt-4 mb-4">
                <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 z-0"></div>
                <div
                  className="absolute top-4 left-0 h-1 bg-emerald-500 z-0 transition-all duration-500"
                  style={{ width: `${(currentPickupStatusIndex / (pickupStatusOrder.length - 1)) * 100}%` }}
                ></div>

                {pickupTimelineSteps.map((step, index) => {
                  const isCompleted = index <= currentPickupStatusIndex;
                  return (
                    <div key={index} className="flex flex-col items-center gap-3 relative z-10 group">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110" : "bg-white border-2 border-gray-200 text-gray-300"}`}>
                        {isCompleted ? <CheckCircle size={16} strokeWidth={3} /> : <Clock size={16} />}
                      </div>
                      <div className="text-center bg-white px-2 mt-1">
                        <p className={`text-sm font-bold ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                        {step.date && isCompleted && (
                          <p className="text-[10px] text-gray-400 font-medium mt-1">
                            {new Date(step.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold text-gray-900">Pickup Items</h3>
                {!["Cancelled", "Out for Pickup", "Completed"].includes(order.pickupStatus) && !isAllitemCancelled && (
                  <button className="text-red-500 text-xs font-bold hover:underline" onClick={() => {setIsCancelModalOpen(true); setIsPickupMode(true)}}>Cancel Pickup</button>
                )}
              </div>
              <div className="hidden sm:flex items-center px-2 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                <div className="flex-1 pl-4 text-left">Product</div>
                <div className="flex items-center justify-between gap-12 text-sm w-auto">
                  <div className="text-center w-15">Qty</div>
                  <div className="text-center w-20">Est. Price</div>
                  <div className="text-center w-20">Total</div>
                  <div className="text-center w-20">Status</div>
                  <div className="text-center w-20">Action</div>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {pickupItems.map((item, idx) => {
                  const imgSrc = item.image || (item.productId?.image && item.productId.image[0]);
                  return (
                    <div key={idx} className="p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50/50">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {imgSrc ? <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" /> : <Package className="text-gray-300" />}
                      </div>
                      <div className="flex-1 w-full text-center sm:text-left">
                         <h4 className="font-bold text-gray-900 text-sm mb-1">{item.name}</h4>
                         <p className="text-xs text-gray-500">Pick-up Request</p>
                      </div>
                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-12 text-sm">
                         <div className="text-center w-15"><span className="font-bold text-gray-700">{item.quantity}</span></div>
                         <div className="text-center w-20"><span className="font-medium text-gray-900">₹{item.productId.price}</span></div>
                         <div className="text-right min-w-20"><span className="font-bold text-gray-900">₹{item.price}</span></div>
                         <div className="text-right min-w-20"><StatusBadge status={item.itemStatus} /></div>
                         <div className="text-right min-w-20">
                            <button onClick={() => { setCancellingItemId(item._id); setIsCancelModalOpen(true); setIsPickupMode(true) }} disabled={ ["Cancelled", "Out for Pickup", "Completed"].includes(order.pickupStatus) || item.itemStatus === "Cancelled"} className="text-red-500 text-xs font-bold hover:underline disabled:text-gray-400 disabled:no-underline">Cancel</button>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-emerald-600">
              <MapPin size={20} />
              <h3 className="font-bold text-gray-900">
                {isPickupMode ? "Pickup Location" : "Delivery Address"}
              </h3>
            </div>
            <div className="pl-8">
              <h4 className="font-bold text-gray-900 text-sm mb-2">{order.pickupAddress.name}</h4>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                {order.pickupAddress.street}, <br />
                {order.pickupAddress.city}, {order.pickupAddress.state} - {order.pickupAddress.pincode}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                <span className="font-medium">{order.pickupAddress.phone}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-emerald-600">
              <CreditCard size={20} />
              <h3 className="font-bold text-gray-900">Order Summary</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Store Items</span>
                <span className="font-medium">₹{order.pricing.storeItems || 0}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pickup Services</span>
                <span className="font-medium">₹{order.pricing.pickupServices || 0}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">₹{order.pricing.subtotal || 0}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Earnings</span>
                <span className="font-medium">₹-{order.pricing.earnings || 0}</span>
              </div>
              {order?.pricing?.offerDiscount > 0 && (
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-500 font-medium">Offers & Discounts</span>
                  <span className="font-bold text-emerald-500">-₹{order.pricing.offerDiscount}</span>
                </div>
              )}
              {order?.pricing?.couponDiscount > 0 && (
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-500 font-medium">Coupon Applied</span>
                  <span className="font-bold text-emerald-500">-₹{order.pricing.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee</span>
                <span className="font-medium">₹{order.pricing.platformFee || 0}</span>
              </div>
              
              <div className="border-t border-gray-100 my-3"></div>
              <div className="flex justify-between items-center text-gray-900 border-t border-gray-100 my-3 pt-3">
                <span className="font-bold">Current Order Total</span>
                <span className="text-lg font-bold">₹{Math.abs(order.pricing.totalAmount || 0)}</span>
              </div>

              <div className="flex justify-between items-center text-gray-500 text-sm mt-3">
                <span className="font-medium">{["Razorpay", "Wallet", "Wallet_and_Razorpay", "Wallet_and_Online"].includes(order.paymentMethod) ? "Paid Initially" : "Cash on Delivery" }
                  ({(order.pricing.walletAmountUsed > 0 && order.pricing.amountToPayOnline > 0) ? "Wallet + " + order.paymentMethod : order.paymentMethod})</span>
                <span className="font-bold">₹{Math.abs(originalPaidAmount)}</span>
              </div>

              {amountDue > 0 && (
                <div className="flex justify-between items-center text-red-600 border-t border-red-100 my-3 pt-3">
                  <span className="font-bold">Outstanding Dues</span>
                  <span className="text-xl font-extrabold flex flex-col items-end">
                      ₹{amountDue}
                      <span className="text-[10px] uppercase tracking-wider font-bold text-red-500 opacity-80 mt-0.5">To Pay at Delivery</span>
                  </span>
                </div>
              )}

              {amountDue < 0 && (
                <div className="flex justify-between items-center text-emerald-600 border-t border-emerald-100 my-3 pt-3">
                  <span className="font-bold">Refund Processed</span>
                  <span className="text-xl font-extrabold flex flex-col items-end">
                     ₹{Math.abs(amountDue)}
                     <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500 opacity-80 mt-0.5">Credited to Wallet</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          {!isAllitemCancelled && <button
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setIsGeneratingInvoice(true);
              setTimeout(() => {
                try {
                  generateInvoice(order);
                } catch (error) {
                  console.error("Error generating invoice:", error);
                  toast.error("Failed to generate invoice");
                } finally {
                  setIsGeneratingInvoice(false);
                }
              }, 50);
            }}
            disabled={isGeneratingInvoice}
          >
            {isGeneratingInvoice ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isGeneratingInvoice ? "Generating PDF..." : "Download Invoice (PDF)"}
          </button>}

        </div>

        {order && (
          <CancelOrderModal
            isOpen={isCancelModalOpen}
            onClose={() => { setIsCancelModalOpen(false); setCancellingItemId(null); }}
            onConfirm={handleCancelOrder}
            orderId={order.orderId}
            isCancelling={isCancelling}
          />
        )}

        {order && (
          <ReturnOrderModal
            isOpen={isReturnModalOpen}
            onClose={() => setIsReturnModalOpen(false)}
            onConfirm={handleReturnOrder}
            orderId={order.orderId}
            isReturning={isReturning}
          />
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
