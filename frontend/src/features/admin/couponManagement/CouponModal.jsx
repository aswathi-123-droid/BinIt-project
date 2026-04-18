import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../../api/axiosInstance';
import { X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CouponModal = ({ isOpen, onClose, refetch, initialData }) => {
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue,
    reset,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      code: '',
      description: '',
      discountType: 'flat',
      discountValue: '',
      minPurchaseAmount: '',
      maxDiscountAmount: '',
      startDate: '',
      expiryDate: '',
      isActive: true
    }
  });

  const discountType = watch('discountType');
  const isActiveStatus = watch('isActive');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          code: initialData.code || '',
          description: initialData.description || '',
          discountType: initialData.discountType || 'flat',
          discountValue: initialData.discountValue || '',
          minPurchaseAmount: initialData.minPurchaseAmount || '',
          maxDiscountAmount: initialData.maxDiscountAmount || '',
          startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
          expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        });
      } else {
        reset({
          code: '',
          description: '',
          discountType: 'flat',
          discountValue: '',
          minPurchaseAmount: '',
          maxDiscountAmount: '',
          startDate: '',
          expiryDate: '',
          isActive: true
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const createMutation = useMutation({
    mutationFn:  (data) => initialData ? api.put(`/admin/coupons/${initialData._id}`, data) : api.post('/admin/coupons', data),
    onSuccess: () => {
      toast.success(initialData ? "Coupon updated!" : "Coupon created!");
      refetch();
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to process coupon");
    }
  });

  const onSubmit = (data) => {
      createMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
      
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {initialData ? 'Edit Coupon' : 'Create New Coupon'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 custom-scrollbar">
          <form id="coupon-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Coupon Code</label>
              <input 
                {...register('code', { required: "Coupon code is required" })} 
                type="text"
                placeholder="e.g. SUMMER50"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 transition-all ${
                  errors.code ? 'border-red-500 focus:ring-red-50' : 'border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5'
                }`}
              />
              {errors.code && <p className="text-[10px] text-red-500">{errors.code.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Description (Shown to users)</label>
              <input 
                {...register('description', { required: "Description is required" })} 
                type="text"
                placeholder="e.g. Get Flat ₹50 off on purchases above ₹500"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.description ? 'border-red-500 focus:ring-red-50' : 'border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5'
                }`}
              />
              {errors.description && <p className="text-[10px] text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Discount Type</label>
                <div className="relative">
                  <select 
                    {...register('discountType')}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/5 focus:border-emerald-500/50 bg-white"
                  >
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Value</label>
                <div className="relative">
                  <input 
                    {...register('discountValue', { 
                      required: 'Value is required', 
                      min: { value: 1, message: 'Value must be greater than 0' }
                    })}
                    type="number"
                    placeholder="0"
                    className={`w-full pl-4 pr-12 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.discountValue ? 'border-red-500 focus:ring-red-50' : 'border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs pointer-events-none">
                    {discountType === 'flat' ? 'rs' : '%'}
                  </div>
                </div>
                {errors.discountValue && <p className="text-[10px] text-red-500">{errors.discountValue.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Start Date</label>
                <div className="relative">
                  <input 
                    {...register('startDate', { required: 'Start date is required' })}
                    type="date"
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.startDate ? 'border-red-500 focus:ring-red-50' : 'border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5'
                    }`}
                  />
                </div>
                {errors.startDate && <p className="text-[10px] text-red-500">{errors.startDate.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Expiry Date</label>
                <div className="relative">
                  <input 
                    {...register('expiryDate', { 
                      required: 'Expiry date is required',
                      validate: (val) => {
                        const start = watch('startDate');
                        return !start || new Date(val) >= new Date(start) || "Expiry date must be after start date";
                      }
                    })}
                    type="date"
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.expiryDate ? 'border-red-500 focus:ring-red-50' : 'border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5'
                    }`}
                  />
                </div>
                {errors.expiryDate && <p className="text-[10px] text-red-500">{errors.expiryDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Min. Cart Value <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                  <input 
                    {...register('minPurchaseAmount')}
                    type="number"
                    placeholder="e.g. 500"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/5 focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Max Discount Amount <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                  <input 
                    {...register('maxDiscountAmount')}
                    type="number"
                    placeholder="e.g. 150"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/5 focus:border-emerald-500/50"
                  />
                </div>
                <p className="text-[10px] text-gray-400">Cap limit for percentage based coupons.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100 cursor-pointer" onClick={() => setValue('isActive', !isActiveStatus)}>
               <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActiveStatus ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'}`}>
                  {isActiveStatus && <Check size={14} className="text-white" strokeWidth={3} />}
               </div>
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Set as Active</span>
                  <span className="text-[10px] text-gray-500">This coupon will be immediately available for users to claim.</span>
               </div>
               <input type="checkbox" {...register('isActive')} className="hidden" />
            </div>

          </form>
        </div>

        <div className="flex justify-end items-center gap-4 px-6 py-5 border-t border-gray-100 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            form="coupon-form"
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <Check size={16} />
            {createMutation.isPending ? "Saving..." : "Save Coupon"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CouponModal;
