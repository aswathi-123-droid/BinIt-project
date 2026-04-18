import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api/axiosInstance';
import { Tag, Copy, Check, Info, Loader2, TicketPercent } from 'lucide-react';
import toast from 'react-hot-toast';

const MyCoupons = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['userCoupons'],
    queryFn: async () => {
      const res = await api.get('cart/coupons');
      return res.data?.data || [];
    }
  });

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Coupon code copied to clipboard!");
    
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-100">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Hunting for the best deals...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-in fade-in duration-500">
      

      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
          <TicketPercent size={28} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Available Coupons</h2>
          <p className="text-sm text-slate-500 mt-1">Copy these codes and apply them at checkout to save money!</p>
        </div>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No Active Coupons Right Now</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
            We don't have any wide-release promotional offers right now. Keep an eye out during the holidays!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {coupons.map((coupon) => (
            <div 
              key={coupon._id} 
              className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex"
            >

              <div className="w-12 bg-emerald-50 border-r border-dashed border-emerald-200 flex flex-col justify-center items-center relative shrink-0">
                <div className="absolute -top-3 w-6 h-6 bg-white rounded-full border-b border-emerald-200"></div>
                <div className="absolute -bottom-3 w-6 h-6 bg-white rounded-full border-t border-emerald-200"></div>
                
                <span className="transform -rotate-90 text-[10px] font-black tracking-[0.2em] text-emerald-600/70 whitespace-nowrap uppercase">
                  BINIT OFFER
                </span>
              </div>

              <div className="flex-1 p-5 flex flex-col">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                      {coupon.discountType === 'percent' 
                        ? `${coupon.discountValue}% OFF` 
                        : `Flat ₹${coupon.discountValue} OFF`
                      }
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      {coupon.description}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleCopy(coupon.code)}
                    className="shrink-0 flex items-center justify-center p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all active:scale-95 group"
                    title="Copy Code"
                  >
                    {copiedCode === coupon.code ? (
                      <Check size={20} className="text-emerald-500" strokeWidth={3} />
                    ) : (
                      <Copy size={20} className="group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between">
                    
                    <div className="px-4 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
                      <span className="text-sm font-black tracking-widest text-slate-700 uppercase">
                        {coupon.code}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <Info size={14} className="text-gray-400" />
                      Min. Cart: ₹{coupon.minPurchaseAmount || 0}
                    </span>
                    
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoupons;
