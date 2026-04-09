import React, { useState, useRef, useEffect } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check } from "lucide-react";
import { getCroppedImg } from "../../../utils/imageUtils";

const ImageCropModal = ({ file, onComplete, onCancel, aspect = 1 }) => {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState();
  const imgRef = useRef(null);
  const [completedCrop, setCompletedCrop] = useState();

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImgSrc(reader.result.toString());
      reader.readAsDataURL(file);
    }
  }, [file]);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height),
      width,
      height
    );
    setCrop(initialCrop);
    setCompletedCrop(convertToPixelCrop(initialCrop, width, height));
  };

  const handleApply = async () => {
  if (imgRef.current && completedCrop && completedCrop.width > 0) {
    const croppedFile = await getCroppedImg(
      imgRef.current, 
      completedCrop, 
      file.name
    );
    onComplete(croppedFile);
  }
};

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">Crop Image</h3>
          <button onClick={onCancel}><X size={20}/></button>
        </div>
        <div className="p-4 overflow-auto bg-slate-100 flex justify-center">
          {imgSrc && (
            <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={aspect} onComplete={(c) => setCompletedCrop(c)}>
              <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} alt="Crop" />
            </ReactCrop>
          )}
        </div>
        <div className="p-4 border-t flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 border rounded-xl">Cancel</button>
          <button onClick={handleApply} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-2">
            <Check size={18}/> Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;