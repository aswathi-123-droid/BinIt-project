import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Tag, Info } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { api } from '../../../api/axiosInstance';

const AvailableCouponsModal = ({ isOpen, onClose, onApply, cartSubtotal }) => {
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['availableCoupons'],
    queryFn: async () => {
      const res = await api.get('cart/coupons'); 
      return res.data?.data || [];
    },
    enabled: isOpen 
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 shrink-0">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Tag className="text-emerald-500" size={24} /> Available Offers
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>


        <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/50">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-medium">No coupons available right now.</div>
          ) : (
            coupons.map((coupon) => {
              const isEligible = cartSubtotal >= coupon.minPurchaseAmount;

              return (
                <div key={coupon._id} className={`relative overflow-hidden border rounded-xl p-5 ${isEligible ? 'bg-white border-emerald-100 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                  
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-r border-emerald-100/50"></div>
                  
                  <div className="flex justify-between gap-4">
                    <div className="flex-1 pl-2">
                       <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-black tracking-widest uppercase border border-dashed ${isEligible ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                             {coupon.code}
                          </span>
                       </div>
                       
                       <p className={`font-bold text-lg mb-1 leading-tight ${isEligible ? 'text-slate-800' : 'text-gray-500'}`}>
                         {coupon.discountType === 'percent' ? `${coupon.discountValue}% OFF` : `Flat ₹${coupon.discountValue} OFF`}
                       </p>
                       
                       <p className="text-xs text-slate-500 leading-relaxed max-w-50">
                         {coupon.description}
                       </p>

                       {!isEligible && (
                           <p className="text-[10px] font-bold text-red-500 mt-3 flex items-center gap-1">
                              <Info size={12} /> Add ₹{coupon.minPurchaseAmount - cartSubtotal} more to unlock
                           </p>
                       )}
                    </div>

                    <div className="flex flex-col justify-center border-l border-dashed border-gray-200 pl-4">
                       <button
                         onClick={() => onApply(coupon.code)}
                         disabled={!isEligible}
                         className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${isEligible ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                       >
                         APPLY
                       </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableCouponsModal;
