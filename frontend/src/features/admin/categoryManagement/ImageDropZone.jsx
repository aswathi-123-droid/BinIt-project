import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

const ImageDropzone = ({ value, onChange }) => {
  const onDrop = useCallback((acceptedFiles) => {
    // Take the first file
    if (acceptedFiles?.length > 0) {
      onChange(acceptedFiles[0]);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false
  });

  // Helper to generate preview URL
  const previewUrl = value instanceof File ? URL.createObjectURL(value) : value;

  if (previewUrl) {
    return (
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200 group">
        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={(e) => {
             e.stopPropagation();
             onChange(null); // Clear image
          }}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-2xl h-full flex flex-col items-center justify-center cursor-pointer transition-colors ${
        isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="p-4 bg-white rounded-full shadow-sm mb-3 text-gray-400">
        <Upload size={24} />
      </div>
      <p className="text-xs font-bold text-slate-700">
        <span className="text-emerald-500 underline">Click to upload</span> or drag and drop
      </p>
      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG UP TO 5MB</p>
    </div>
  );
};

export default ImageDropzone;