import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Recycle, Trash2, Check, ShoppingBag } from 'lucide-react'; // Added ShoppingBag
import ImageDropzone from '../../../components/common/ImageDropZone';

const CategoryModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      type: 'recyclable',
      isActive: true,
      image: null
    }
  });

  const categoryType = watch('type');
  const isActiveStatus = watch('isActive');
  const currentImage = watch('image');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name || '',
          description: initialData.description || '',
          type: initialData.type || 'recyclable',
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
          image: initialData.image || null
        });
      } else {
        reset({
          name: '',
          description: '',
          type: 'recyclable',
          isActive: true,
          image: null
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Compact Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? 'Edit Category' : 'Add New Category'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto custom-scrollbar">
            <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
            
            {/* Row 1: Name */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Category Name</label>
                <input 
                {...register('name', { required: 'Required' })}
                type="text"
                placeholder="e.g. Heavy Duty Bags"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.name 
                    ? 'border-red-500 focus:ring-red-50' 
                    : 'border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5'
                }`}
                />
                {errors.name && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
            </div>

            {/* Row 2: Type Selection (3 Buttons) */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Type</label>
                <div className="flex gap-2">
                {/* Earn Button */}
                <button
                    type="button"
                    onClick={() => setValue('type', 'recyclable')}
                    className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg border text-xs font-bold transition-all ${
                    categoryType === 'recyclable'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    <Recycle size={14} /> Earn
                </button>

                {/* Pay Button */}
                <button
                    type="button"
                    onClick={() => setValue('type', 'junk')}
                    className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg border text-xs font-bold transition-all ${
                    categoryType === 'junk'
                        ? 'border-slate-800 bg-slate-100 text-slate-900'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    <Trash2 size={14} /> Pay
                </button>

                {/* NEW: Store Button */}
                <button
                    type="button"
                    onClick={() => setValue('type', 'store')}
                    className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg border text-xs font-bold transition-all ${
                    categoryType === 'store'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    <ShoppingBag size={14} /> Store
                </button>
                </div>
            </div>

            {/* Row 3: Description */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea 
                {...register('description', { required: 'Required' })}
                rows="2"
                placeholder="Brief description..."
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                    errors.description 
                    ? 'border-red-500 focus:ring-red-50' 
                    : 'border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5'
                }`}
                />
                {errors.description && <p className="text-[10px] text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Category Image</label>
                <div className="h-32">
                <ImageDropzone 
                    value={currentImage} 
                    onChange={(file) => {
                    setValue('image', file, { shouldValidate: true, shouldDirty: true });
                    }}
                />
                </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700">Active Status</span>
                <span className="text-[10px] text-gray-400">Visible on app</span>
                </div>
                <button
                type="button"
                onClick={() => setValue('isActive', !isActiveStatus)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                    isActiveStatus ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
                >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center ${
                    isActiveStatus ? 'translate-x-5' : 'translate-x-0'
                }`}>
                    {/* {isActiveStatus && <Check size={8} className="text-emerald-500" strokeWidth={4} />} */}
                </div>
                </button>
            </div>
            </form>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="category-form"
            className="flex-1 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-md active:scale-95"
          >
            {initialData ? 'Update' : 'Save'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CategoryModal;