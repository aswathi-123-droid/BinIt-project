import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Check, Recycle, Trash, ShoppingBag, Info } from 'lucide-react';
import ImageDropzone from '../categoryManagement/ImageDropzone';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api/axiosInstance';

const ProductModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  // ... (useForm hook remains the same)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError, 
    clearErrors,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      categoryId: '',
      type: 'recyclable',
      price: '',
      unit: 'kg',
      stock: '',
      isEstimationEnabled: false,
      isActive: true,
      image: [] // Note: Based on previous turns, this should likely be 'images: []' for multiple, but sticking to your provided code for now.
    }
  });

  // ... (watchers and useEffect remain the same)
  const itemType = watch('type');
  const isActiveStatus = watch('isActive');
  const isEstimationEnabled = watch('isEstimationEnabled');
  const currentImage = watch('image');
  const imageList = Array.isArray(currentImage) ? currentImage : (currentImage ? [currentImage] : []);

  useEffect(() => {
    register('image', { 
        validate: (val) => {
            const len = Array.isArray(val) ? val.length : (val ? 1 : 0);
            return len >= 4 || "Minimum 4 images are required";
        }
    });
  }, [register]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          // ... (reset logic)
          name: initialData.name || '',
          categoryId: initialData.category?._id || '',
          type: initialData.type || 'recyclable',
          price: initialData.price || '',
          unit: initialData.unit || 'kg',
          stock: initialData.stock || '',
          isEstimationEnabled: initialData.isEstimationEnabled || false,
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
          image: initialData.image || []
        });
      } else {
        reset({
          // ... (reset logic)
          name: '',
          categoryId: '',
          type: 'recyclable',
          price: '',
          unit: 'kg',
          stock: '',
          isEstimationEnabled: false,
          isActive: true,
          image: []
        });
      }
    }
  }, [isOpen, initialData, reset]);


  const { data, isLoading: isCategoriesLoading ,error} = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/admin/categories"); 
      return res.data; 
    },
    enabled: isOpen, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });
  
  
  const categories = data?.categories ||(Array.isArray(data) ? data : []);
  console.log(categories)

  const handleModalSubmit = (data) => {
  if (!data.image || data.image.length < 4) {
      setError("image", { type: "manual", message: "Minimum 4 images are required" }); // Show error if trying to hack/force submit
      return; 
  }
    const formData = new FormData();

    // Loop through every key in your form data
    Object.keys(data).forEach((key) => {
      
      // Special handling for the 'image' array
      if (key === 'image' && Array.isArray(data[key])) {
        data[key].forEach((file) => {
             // Appends both new Files (uploads) and Strings (existing URLs)
             formData.append('image', file); 
        });
      } 
      // Handle all other fields (name, price, stock, type, etc.)
      else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 shrink-0">
          <h3 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Inventory Item' : 'Add New Item'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-slate-600 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto px-6 py-6 custom-scrollbar">
          <form id="inventory-form" onSubmit={handleSubmit(handleModalSubmit)} className="space-y-6">
            
            {/* Row 1 to Row 4 remain exactly the same as your provided code */}
            {/* ... (Row 1: Item Name & Category) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ... inputs ... */}
                 <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Item Name</label>
                <input 
                  {...register('name', { required: 'Item name is required' })}
                  type="text"
                  placeholder="e.g. Cardboard Boxes"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? 'border-red-500 focus:ring-red-50' : 'border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Category</label>
                <div className="relative">
                <select 
                  {...register('categoryId', { required: 'Category is required' })}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 bg-white ${
                      errors.categoryId ? 'border-red-500 focus:ring-red-50' : 'border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5'
                  }`}
                >
                  <option value="">Select a category...</option>
                  
                  {/* Show loading state */}
                  {isCategoriesLoading && <option disabled>Loading categories...</option>}

                  {/* Map through fetched categories */}
                  {!isCategoriesLoading && categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                </div>
                {errors.categoryId && <p className="text-[10px] text-red-500">{errors.categoryId.message}</p>}
              </div>
            </div>
            
            {/* ... (Row 2: Item Type) ... */}
             <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Item Type & Business Model</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('type', 'recyclable')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1.5 ${
                    itemType === 'recyclable'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700'
                    : 'border-gray-100 hover:border-gray-200 text-gray-500'
                  }`}
                >
                  <Recycle size={20} />
                  <div className="text-center">
                    <span className="block text-xs font-bold">Earn</span>
                    <span className="block text-[10px] opacity-70">Recyclables (Green)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('type', 'junk')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1.5 ${
                    itemType === 'junk'
                    ? 'border-slate-800 bg-slate-50 text-slate-800'
                    : 'border-gray-100 hover:border-gray-200 text-gray-500'
                  }`}
                >
                  <Trash size={20} />
                  <div className="text-center">
                    <span className="block text-xs font-bold">Pay</span>
                    <span className="block text-[10px] opacity-70">Junk Removal (Dark)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('type', 'store')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1.5 ${
                    itemType === 'store'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-700'
                    : 'border-gray-100 hover:border-gray-200 text-gray-500'
                  }`}
                >
                  <ShoppingBag size={20} />
                  <div className="text-center">
                    <span className="block text-xs font-bold">Store</span>
                    <span className="block text-[10px] opacity-70">Sell Items (Blue)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* ... (Row 3: Pricing) ... */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Base Price / Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                  <input 
                    {...register('price', { required: 'Price is required', min: 0 })}
                    type="number"
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.price ? 'border-red-500 focus:ring-red-50' : 'border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5'
                    }`}
                  />
                </div>
                {errors.price && <p className="text-[10px] text-red-500">{errors.price.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Unit Type</label>
                <select 
                  {...register('unit')}
                  disabled={isEstimationEnabled}
                  className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/5 ${
                      isEstimationEnabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="kg">Per Kg (Weight)</option>
                  <option value="unit">Per Unit (Item)</option>
                  <option value="bag">Per Bag (Volume)</option>
                </select>
                {isEstimationEnabled ? (
                    <p className="text-[10px] text-emerald-600 font-medium">Locked to 'Kg' because estimation is enabled.</p>
                ) : (
                    <p className="text-[10px] text-gray-400">Select pricing model (e.g. ₹12/kg).</p>
                )}
              </div>
            </div>

            {/* ... (Row 4: Conditional) ... */}
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              {itemType === 'store' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold text-slate-700">Opening Stock Quantity</label>
                  <div className="relative">
                    <input 
                      {...register('stock', { required: itemType === 'store' ? 'Stock is required' : false })}
                      type="number"
                      placeholder="e.g. 50"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">items</div>
                  </div>
                  <p className="text-[10px] text-blue-500 font-medium flex items-center gap-1">
                    <Info size={12} /> Track inventory for items you sell.
                  </p>
                </div>
              )}

              {itemType === 'recyclable' && (
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="mt-1">
                  <Info size={18} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-slate-800">Allow "Bag Count" Input?</p>
                    
                    {/* The Toggle Switch Logic */}
                    <div 
                      onClick={() => {
                          const newState = !isEstimationEnabled;
                          setValue('isEstimationEnabled', newState);
                          // Force Unit to 'kg' if turning ON
                          if(newState) setValue('unit', 'kg'); 
                      }}
                      className={`w-10 h-5 rounded-full cursor-pointer transition-colors duration-200 flex items-center p-0.5 ${
                        isEstimationEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        isEstimationEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                    
                    {/* Hidden Input for Form Data */}
                    <input type="checkbox" {...register('isEstimationEnabled')} className="hidden" />
                  </div>
                  
                  <p className="text-[10px] text-slate-600 leading-tight">
                    If ON: Users see <b>"Select Bag Size"</b> instead of "Enter Kg".
                  </p>
                </div>
              </div>
            )}

              {itemType === 'junk' && (
                 <p className="text-[10px] text-gray-400 text-center italic">Service items usually have unlimited stock.</p>
              )}
            </div>

            {/* Row 5: Image Upload - CHANGED HEIGHT HERE */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">
                      Item Images <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[10px] font-bold ${imageList.length >= 4 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {imageList.length} uploaded (Min 4 required)
                  </span>
              </div>
              {/* Increased height from h-32 to h-52 for better visibility */}
              <div className="h-56"> 
                 <ImageDropzone 
                    value={currentImage} 
                    multiple={true}     
                    onChange={(file) => {
                        // When user adds files, clear the error if they meet the requirement
                        const newFiles = Array.isArray(file) ? file : (file ? [file] : []);
                        setValue('image', newFiles, { shouldValidate: true, shouldDirty: true });
                        if(newFiles.length >= 4) clearErrors("image");
                    }}
                 />
              </div>
              {errors.image && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                      <Info size={12} /> {errors.image.message}
                  </p>
              )}
              <p className="text-[10px] text-gray-400">Upload minimun 4 images representing the item.</p>
            </div>

            {/* ... (Row 6: Status) ... */}
             <div 
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => setValue('isActive', !isActiveStatus)}
            >
               <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                 isActiveStatus ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'
               }`}>
                  {isActiveStatus && <Check size={14} className="text-white" strokeWidth={3} />}
               </div>
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Set as Active</span>
                  <span className="text-[10px] text-gray-500">Item will be visible in the catalog immediately.</span>
               </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center gap-4 px-6 py-5 border-t border-gray-100 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            form="inventory-form"
            type="submit"
            className="px-6 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <Check size={16} />
            {initialData ? 'Update Item' : 'Save New Item'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductModal;