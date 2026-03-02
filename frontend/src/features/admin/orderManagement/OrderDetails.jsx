import React, { useState } from 'react';
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
    Mail
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/axiosInstance';
import StatusBadge from '../../user/profile/myOrders/components/StatusBadge';
import toast from 'react-hot-toast';

const AdminOrderDetails = ({ mode = 'order' }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient()
    const isPickupMode = mode === 'pickup';
    const itemLabel = isPickupMode ? 'Pickup' : 'Order';

    const {data:order, isLoading} = useQuery({
        queryKey: ["adminorders", id],
        queryFn:async ()=> {
            const res = await api.get(`/admin/order/orders/${id}`)
            return res.data.order
        }
    })
    console.log(order)
        const updateStatusMutation = useMutation({
        mutationFn: async (newStatus) => {
            const res = await api.put(`/admin/order/orders/${id}/status`, { status: newStatus });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Status updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["adminorders",id] }); 
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update order status");
        }
    });
    const handleUpdateStatus = (newStatus) => {
        updateStatusMutation.mutate(newStatus);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 text-emerald-500 font-semibold">
                Loading Details...
            </div>
        );
    }

    return (
        <div  className="p-4  bg-gray-50 h-[calc(100vh-60px)] overflow-y-auto pb-24 font-sans">
            
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 bg-white rounded-full transition-colors border border-gray-200 shadow-sm"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{itemLabel} Details</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            ID: <span className="text-slate-700 font-bold">{order._id}</span>
                        </p>
                    </div>
                </div>
                  <StatusBadge status={order.status}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    
                    <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
                            <Package className="text-emerald-500" size={20} />
                            <h2 className="text-lg font-bold text-gray-800">Items ({!isLoading ? order.items.filter(item => {
                                const type = item.productId?.type;
                                return isPickupMode ? (type === 'earn' || type === 'recyclable') : type === 'store';
                            }).length : 0})</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {!isLoading && order.items.filter(item => {
                                        const type = item.productId?.type;
                                        return isPickupMode ? (type === 'junk' || type === 'recyclable') : type === 'store';
                                    }).map((item, index) => (
                                    <div key={item.productId?._id || index} className="flex flex-col gap-4 p-4 border border-gray-100 rounded-2xl hover:border-emerald-100 transition-colors bg-gray-50/30">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 overflow-hidden shrink-0 mt-1">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                                                        {item.selectionName && (
                                                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{item.selectionType}: {item.selectionName}</p>
                                                        )}
                                                        <p className="text-sm font-semibold text-emerald-600 mt-1">₹{item.price.toLocaleString('en-IN')} x {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-extrabold text-slate-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {isPickupMode && item.userUploadedImages && item.userUploadedImages.length > 0 && (
                                            <div className="mt-1 pt-3 border-t border-gray-100 w-full">
                                                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Admin Verification Images</p>
                                                <div className="flex gap-2 overflow-x-auto pb-2">
                                                    {item.userUploadedImages.map((img, i) => (
                                                        <a href={img} target="_blank" rel="noreferrer" key={i}>
                                                            <img src={img} alt="User Upload" className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer shadow-sm" />
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
                            <h2 className="text-lg font-bold text-gray-800">Payment Summary</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3 text-sm font-medium text-gray-500">
                                <div className="flex justify-between items-center">
                                    <span>Subtotal</span>
                                    <span className="text-slate-700 font-bold">₹{(order.pricing?.subtotal || 0 ).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Platform Fee</span>
                                    <span className="text-slate-700 font-bold">₹{(order.pricing?.platformFee || 0).toLocaleString('en-IN')}</span>
                                </div>
                                {order.pricing.couponDiscount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600">
                                        <span>Discount</span>
                                        <span>- ₹{order.pricing?.couponDiscount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-base font-bold text-gray-900">Total Amount ({order.paymentMethod})</span>
                                    <span className="text-xl font-extrabold text-indigo-600 shadow-sm">
                                        ₹{(order.pricing?.totalAmount || 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2 pt-2 text-xs">
                                     <span>Status: <strong className={order.paymentStatus === "Completed" ? "text-emerald-500" : "text-orange-500"}>{order.paymentStatus}</strong></span>
                                     {order.transactionId && <span>Txn ID: {order.transactionId}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                 
                    <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden border-t-4 border-t-emerald-500">
                        <div className="px-6 py-5 border-b border-gray-50 backdrop-blur-sm">
                            <h2 className="text-lg font-bold text-gray-800">Update Status</h2>
                            <p className="text-xs text-gray-500 mt-1">Manage this {itemLabel.toLowerCase()}'s lifecycle</p>
                        </div>
                        <div className="p-6 space-y-3">
                            
                            {order.status === 'Placed' && (
                                <>
                                    <button onClick={() => handleUpdateStatus('Confirmed')} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-indigo-200 flex items-center justify-center gap-2">
                                        <CheckCircle2 size={18} /> Accept {itemLabel}
                                    </button>
                                    <button onClick={() => handleUpdateStatus('Cancelled')} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all active:scale-95 border border-red-100 flex items-center justify-center gap-2">
                                        <XCircle size={18} /> Cancel {itemLabel}
                                    </button>
                                </>
                            )}

                            {order.status === 'Confirmed' && (
                                <>
                                    <button onClick={() => handleUpdateStatus('Shipped')} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-blue-200 flex items-center justify-center gap-2">
                                        <Truck size={18} /> Mark as Shipped
                                    </button>
                                     <button onClick={() => handleUpdateStatus('Cancelled')} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all active:scale-95 border border-red-100">
                                         Cancel {itemLabel}
                                    </button>
                                </>
                            )}

                            {order.status === 'Shipped' && (
                                <button onClick={() => handleUpdateStatus('Delivered')} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-200 flex items-center justify-center gap-2">
                                    <CheckCircle2 size={18} /> Mark as Delivered
                                </button>
                            )}

                            {['Delivered', 'Completed', 'Cancelled', 'Returned'].includes(order.status) && (
                                <div className={`w-full py-3 rounded-xl border text-center font-bold text-sm ${order.status=="Delevered"?"bg-emerald-50 text-emerald-600 border-emerald-100":"bg-red-50 text-red-600 border-red-100"}`}>
                                    This {itemLabel.toLowerCase()} is {order.status}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden">
                         <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-2">
                            <User className="text-blue-500" size={18} />
                            <h2 className="text-base font-bold text-gray-800">Customer Details</h2>
                        </div>
                        <div className="pl-6 pb-4">
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Name</p>
                                    <p className="text-sm font-bold text-slate-800">{order.userId.name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                        <Mail size={14} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 truncate">{order.userId.email}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                                        <Phone size={14} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">{order.userId.phone || 'No phone provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden">
                         <div className="px-6 py-2 border-b border-gray-50 flex items-center gap-2">
                            <MapPin className="text-orange-500" size={18} />
                            <h2 className="text-base font-bold text-gray-800">Delivery Address</h2>
                        </div>
                        <div className="pl-6 pb-4">
                             <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                {order.pickupAddress.street},<br />
                                {order.pickupAddress.locality},<br />
                                {order.pickupAddress.city}, {order.pickupAddress.state} - <span className="font-bold">{order.pickupAddress.pincode}</span>
                             </p>
                             
                             <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-3">
                                 <Calendar size={16} className="text-gray-400" />
                                 <div>
                                     <p className="text-xs text-gray-400 font-medium">Placed On</p>
                                     <p className="text-sm font-bold text-slate-700">
                                         {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                     </p>
                                 </div>
                             </div>

                             {isPickupMode && order.pickupDate && (
                                 <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 bg-indigo-50/50 -mx-6 px-6 py-4 rounded-b-3xl">
                                     <Calendar size={20} className="text-indigo-500" />
                                     <div>
                                         <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-0.5">Scheduled Pickup</p>
                                         <p className="text-base font-extrabold text-indigo-900">
                                             {new Date(order.pickupDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
