import React from "react";
import {
  Camera,
  Plus,
  Info,
  ArrowRight,
  Trash2,
  Wallet,
  User,
  Menu,
  Loader2,
  Upload,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../api/axiosInstance";
import toast from "react-hot-toast";

const UploadTrash = ({ onNext }) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) =>
      api.patch("/cart/upload-images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      toast.success("Photos uploaded for verification");
      queryClient.invalidateQueries(["cart"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to upload image");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data) => api.patch("/cart/delete-image", data),
    onSuccess: () => {
      toast.success("Image deleted successfully");
      queryClient.invalidateQueries(["cart"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete image");
    },
  });

  const handleDeleteImage = (e, imageToDelete ,productId,selectionName) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this image?")) {
      deleteMutation.mutate({
        productId,
        selectionName,
        imageUrl: imageToDelete,
      });
    }
  };
  
  const handleProceed = ()=>{
      const hasImages = wasteItems.every(item => item.userUploadedImages?.length >=3);

        if (!hasImages) {
       toast.error("Please upload at least three image to proceed.");
        return;
     }
      onNext();
  }

  const handleFileChange = (e, productId, selectionName,currentImagesCount) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (currentImagesCount + files.length > 3) {
      toast.error("You can only upload a maximum of 3 images per item.");
      return;
    }

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("selectionName", selectionName);
    files.forEach((file) => formData.append("wasteImages", file));
    uploadMutation.mutate(formData);
  };

  let wasteItems =
    data?.cart?.items.filter((x) => x.productId.type !== "store") || [];
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          Step 1: Upload Pictures of Your Trash
        </h1>
        <p className="text-gray-500 text-lg">
          Help our team prepare by uploading photos of the items.
        </p>
      </div>

      <div className="space-y-12">
        {wasteItems.length > 0 ? (
          wasteItems.map((item) =>{
            const currentCount = item.userUploadedImages?.length || 0;
            return (
            <div key={item._id}>
              <div className="flex items-center gap-3 mb-5">
                <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-bold">
                  {item.quantity}x
                </span>
              </div>
              <div>
                <div className="flex gap-3">
                 
                  <input
                    type="file"
                    id={`file-upload-${item._id}`}
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(
                        e,
                        item.productId._id,
                        item.selectionName,
                        currentCount
                      )
                    }
                  />

                
                  <div className=" flex gap-2 mb-4">
                    <div className=" w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      {uploadMutation.isPending &&
                      uploadMutation.variables?.get("productId") ===
                        item.productId._id &&
                      uploadMutation.variables?.get("selectionName") ===
                        item.selectionName ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Upload size={18} />
                      )}
                    </div>

                    
                    <label
                      htmlFor={`file-upload-${item._id}`}
                      className={` px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center ${
                        uploadMutation.isPending &&
                        uploadMutation.variables?.get("productId") ===
                          item.productId._id &&
                        uploadMutation.variables?.get("selectionName") ===
                          item.selectionName
                          ? "bg-gray-100 text-gray-400"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {uploadMutation.isPending &&
                      uploadMutation.variables?.get("productId") ===
                        item.productId._id &&
                      uploadMutation.variables?.get("selectionName") ===
                        item.selectionName
                        ? "Uploading..."
                        : `Upload Photo for ${item.name.split(" ")[0]}`}
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               
                {item.userUploadedImages?.map((img, idx) => (
                  <div
                    key={idx}
                    className="h-32 rounded-xl overflow-hidden border border-gray-200 relative group"
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt="preview"
                    />
                    <button
                      onClick={(e) => handleDeleteImage(e, img ,item.productId._id, item.selectionName)}
                      disabled={deleteMutation.isPending}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:bg-gray-400"
                    >
                      {/* <Trash2 size={12} /> */}
                       {deleteMutation.isPending && deleteMutation.variables?.imageUrl === img ? (
                          <Loader2 size={12} className="animate-spin" /> 
                      ) : (
                          <Trash2 size={12} />
                      )}
                    </button>
                  </div>
                ))}

              </div>
            </div>
          )})
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-gray-500">No pickup items in your bin.</p>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex gap-4 mt-8">
          <Info className="text-emerald-600 shrink-0" size={22} />
          <p className="text-emerald-700 text-sm">
            Good lighting and multiple angles help us provide accurate pricing.
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <button 
          onClick={handleProceed}
          className="bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2">
            Proceed to Address <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const UploadBox = ({ icon, label, active }) => (
  <button
    className={`
    h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all
    ${
      active
        ? "border-emerald-200 bg-emerald-50/50 text-emerald-600"
        : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50 text-emerald-500"
    }
  `}
  >
    <div
      className={`p-2 rounded-full ${active ? "bg-white" : "bg-emerald-50"}`}
    >
      {icon}
    </div>
    <span className="text-xs font-medium text-gray-500">{label}</span>
  </button>
);

export default UploadTrash;
