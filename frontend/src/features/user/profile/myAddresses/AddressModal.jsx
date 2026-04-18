import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Home, Briefcase, MapPin, X } from 'lucide-react';

const AddressModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors,dirtyFields }
  } = useForm({
    defaultValues: {
      type: 'Home',
      name: '',
      phone: '',
      flat: '',
      street: '',
      locality: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    }
  });

  const selectedType = watch("type");

  
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData); 
      } else {
        reset({
            type: 'Home',
            name: '',
            phone: '',
            flat: '',
            street: '',
            locality: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: false
        }); 
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200 my-8">
        
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Address' : 'Add New Address'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Address Type</label>
            <div className="flex gap-4">
              {['Home', 'Work', 'Other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('type', type)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg border text-sm font-medium transition-all ${
                    selectedType === type
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {type === 'Home' && <Home size={16} />}
                  {type === 'Work' && <Briefcase size={16} />}
                  {type === 'Other' && <MapPin size={16} />}
                  {type}
                </button>
              ))}
            </div>
            
            <input type="hidden" {...register("type")} />
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            
           
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Full Name</label>
              <input 
                {...register("name", { required: "Name is required" })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400"
                placeholder="e.g. Al Ameen S"
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
            </div>

           
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Phone Number</label>
              <input 
                {...register("phone", { 
                  required: "Phone number is required",
                  pattern: { value: /^[0-9+\s]+$/, message: "Invalid phone number" }
                })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400"
                placeholder="e.g. +91 98765 43210"
              />
              {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
            </div>

            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Flat / House No.</label>
              <input 
                {...register("flat", { required: "Flat/House No. is required" })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400"
                placeholder="e.g. Flat 402"
              />
              {errors.flat && <span className="text-xs text-red-500">{errors.flat.message}</span>}
            </div>

            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Building / Street Name</label>
              <input 
                {...register("street", { required: "Street name is required" })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400"
                placeholder="e.g. Emerald Heights"
              />
              {errors.street && <span className="text-xs text-red-500">{errors.street.message}</span>}
            </div>

            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Locality / Area</label>
              <input 
                {...register("locality", { required: "Locality is required" })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400"
                placeholder="e.g. Sector 12"
              />
              {errors.locality && <span className="text-xs text-red-500">{errors.locality.message}</span>}
            </div>

            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">City</label>
              <input 
                {...register("city", { required: "City is required" })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400"
                placeholder="e.g. Green City"
              />
              {errors.city && <span className="text-xs text-red-500">{errors.city.message}</span>}
            </div>

            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">State</label>
              <div className="relative">
                <select 
                  {...register("state", { required: "State is required" })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-colors text-gray-700"
                >
                  <option value="">Select State</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Maharashtra">Maharashtra</option>
                </select>
                
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              {errors.state && <span className="text-xs text-red-500">{errors.state.message}</span>}
            </div>

            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Pincode</label>
              <input 
                {...register("pincode", { 
                  required: "Pincode is required",
                  pattern: { value: /^[0-9]{6}$/, message: "Invalid Pincode" }
                })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400"
                placeholder="e.g. 560102"
              />
              {errors.pincode && <span className="text-xs text-red-500">{errors.pincode.message}</span>}
            </div>

          </div>

          
          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox"
              id="isDefault"
              {...register("isDefault")}
              className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="isDefault" className="text-sm font-medium text-gray-600 select-none cursor-pointer">
              Set as Default Address
            </label>
          </div>

          
          <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-100 mt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-8 py-2.5 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Save Address
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddressModal;