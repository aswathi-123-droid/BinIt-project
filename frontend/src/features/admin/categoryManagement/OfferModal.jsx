import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Check } from 'lucide-react';

const OfferModal = ({ isOpen, onClose, onSubmit, initialData, categoryName }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      discountType: 'flat', 
      value: '',
      startDate: '',
      expiryDate: '',
      maxRedeemableAmount: '',
      minTransactionalValue: '',
      description: '',
      isActive: true
    }
  });

  const discountType = watch('discountType');
  const isActiveStatus = watch('isActive');
  console.log(initialData)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title || '',
          discountType: initialData.discountType || 'flat',
          value: initialData.value || '',
          startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
          expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
          maxRedeemableAmount: initialData.maxRedeemableAmount || '',
          minTransactionalValue: initialData.minTransactionalValue || '',
          description: initialData.description || '',
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        });
      } else {
        reset({
          title: '',
          discountType: 'flat',
          value: '',
          startDate: '',
          expiryDate: '',
          maxRedeemableAmount: '',
          minTransactionalValue: '',
          description: '',
          isActive: true
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
      
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {initialData ? 'Edit Offer' : 'Add Offer'} for <span className="text-emerald-500">{categoryName.name}</span>
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
          <form id="offer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Offer Name / Title</label>
              <input 
                {...register('title', { required: 'Offer title is required' })}
                type="text"
                placeholder="e.g. Winter Recycling Bonus"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.title ? 'border-red-500 focus:ring-red-50' : 'border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5'
                }`}
              />
              {errors.title && <p className="text-[10px] text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Offer Type</label>
                <div className="relative">
                  <select 
                    {...register('discountType')}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/5 focus:border-emerald-500/50 bg-white"
                  >
                    <option value="flat">Flat Amount Off</option>
                    <option value="percent">Percentage Off</option>
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
                    {...register('value', { 
                      required: 'Value is required', 
                      min: { value: 1, message: 'Value must be greater than 0' }
                    })}
                    type="number"
                    placeholder="0"
                    className={`w-full pl-4 pr-12 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.value ? 'border-red-500 focus:ring-red-50' : 'border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs pointer-events-none">
                    {discountType === 'flat' ? 'rs' : '%'}
                  </div>
                </div>
                {errors.value && <p className="text-[10px] text-red-500">{errors.value.message}</p>}
                <p className="text-[10px] text-gray-400">Enter percentage or flat amount based on type.</p>
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
              {discountType === "percent" && (<div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Max Redeemable Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                  <input 
                    {...register('maxRedeemableAmount')}
                    type="number"
                    placeholder="500"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/5 focus:border-emerald-500/50"
                  />
                </div>
                <p className="text-[10px] text-gray-400">Cap limit for percentage based offers.</p>
              </div>)}

              {/* <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Min Transaction Value <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                  <input 
                    {...register('minTransactionalValue')}
                    type="number"
                    placeholder="300"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/5 focus:border-emerald-500/50"
                  />
                </div>
              </div> */}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Offer Description / Conditions <span className="text-gray-400 font-normal">(Optional)</span></label>
              <textarea 
                {...register('description')}
                rows="3"
                placeholder="Explain details, eligibility criteria, or specific conditions..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/5 focus:border-emerald-500/50 resize-none"
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100 cursor-pointer" onClick={() => setValue('isActive', !isActiveStatus)}>
               <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActiveStatus ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'}`}>
                  {isActiveStatus && <Check size={14} className="text-white" strokeWidth={3} />}
               </div>
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Set as Active</span>
                  <span className="text-[10px] text-gray-500">This offer will be immediately available for the selected category.</span>
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
            form="offer-form"
            type="submit"
            className="px-6 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <Check size={16} />
            Save Offer
          </button>
        </div>

      </div>
    </div>
  );
};

export default OfferModal;