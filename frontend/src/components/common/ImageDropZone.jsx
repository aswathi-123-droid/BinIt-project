import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageDropzone = ({ value, onChange, multiple = false }) => {
  

  const files = Array.isArray(value) ? value : (value ? [value] : []);

  const onDrop = useCallback((acceptedFiles) => {
    if (multiple) {
      // Multiple Mode: INFINITE UPLOAD
      // Simply append all new files to the existing list
      if (acceptedFiles.length > 0) {
        onChange([...files, ...acceptedFiles]);
      }
    } else {
      // Single Mode: Replace the existing file
      if (acceptedFiles.length > 0) {
        onChange(acceptedFiles[0]);
      }
    }
  }, [files, multiple, onChange]);

  const removeFile = (e, indexToRemove) => {
    e.stopPropagation(); // Stop the click from opening the file picker
    if (multiple) {
      const newFiles = files.filter((_, index) => index !== indexToRemove);
      onChange(newFiles);
    } else {
      onChange(null);
    }
  };

  // Helper: Handle both File objects and URL strings
  const getPreviewSource = (file) => {
    if (typeof file === 'string') return file;
    if (file instanceof File) return URL.createObjectURL(file);
    return null;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: () => {
       toast.error("Invalid file! Please upload only JPG, PNG, or WEBP images.");  
    },
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: multiple,
    noClick: !multiple && files.length > 0 
  });


  if (!multiple && files.length > 0) {
    const previewUrl = getPreviewSource(files[0]);
    return (
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200 group">
        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={(e) => removeFile(e, 0)}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 transition-colors cursor-pointer z-10"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

 
  return (
    <div className="w-full h-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl h-full p-4 transition-colors ${
          isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
        } ${files.length > 0 ? 'cursor-default' : 'cursor-pointer flex flex-col items-center justify-center'}`}
      >
        <input {...getInputProps()} />

        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="p-3 bg-white rounded-full shadow-sm mb-3 text-gray-400">
              <Upload size={24} />
            </div>
            <p className="text-xs font-bold text-slate-700 text-center">
              <span className="text-emerald-500 underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-[10px] text-gray-400 mt-1 text-center">
              PNG, JPG UP TO 5MB {multiple && "(Upload multiple)"}
            </p>
          </div>
        ) : (
          
          <div className="flex flex-wrap gap-3 w-full h-full content-start">
            {files.map((file, index) => (
              <div key={index} className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group shrink-0">
                <img
                  src={getPreviewSource(file)}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => removeFile(e, index)}
                  className="absolute top-1 right-1 p-1 bg-white/90 rounded-full shadow-sm text-gray-500 hover:text-red-500 transition-colors z-10"
                >
                  <X size={12} />
                </button>
              </div>
            ))}


            {multiple && (
              <div 
                className="flex flex-col items-center justify-center w-20 h-20 bg-white border-2 border-dashed border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors text-emerald-500 shrink-0"
              >
                <Plus size={20} />
                <span className="text-[10px] font-bold mt-1">Add</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDropzone;