import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  X,
  Check,
  Recycle,
  Trash,
  ShoppingBag,
  Info,
  Plus,
  Layers,
  Loader2,
} from "lucide-react";
import ImageDropzone from "../../../components/common/ImageDropZone";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../api/axiosInstance";
import ImageCropModal from "../components/ImageCropModal";

const ProductModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting }) => {
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [cropImage, setCropImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      type: "recyclable",
      price: "",
      unit: "unit",
      stock: "",
      isEstimationEnabled: false,
      isActive: true,
      hasVariations: false,
      variations: [],
      image: [],
    },
  });

  const itemType = watch("type");
  const isActiveStatus = watch("isActive");
  const isEstimationEnabled = watch("isEstimationEnabled");
  const hasVariations = watch("hasVariations");
  const currentImage = watch("image");
  console.log(currentImage);
  const imageList = Array.isArray(currentImage)
    ? currentImage
    : currentImage
      ? [currentImage]
      : [];

  const [varName, setVarName] = useState("");
  const [varPrice, setVarPrice] = useState("");
  const currentVariations = watch("variations") || [];

  useEffect(() => {
    register("image", {
      validate: (val) => {
        console.log(val);
        const len = Array.isArray(val) ? val.length : val ? 1 : 0;
        return len >= 4 || "Minimum 4 images are required";
      },
    });
  }, [register]);

  const { data, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/admin/categories");
      return res.data;
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const categories = data?.categories || (Array.isArray(data) ? data : []);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setExistingImages(initialData.image || []);
        setNewFiles([]);
        reset({
          name: initialData.name || "",
          categoryId: initialData.categoryId?._id || (typeof initialData.categoryId === "string" ? initialData.categoryId : "") || "",
          description: initialData.description || "",
          type: initialData.type || "recyclable",
          price: initialData.price || "",
          unit: initialData.unit || "unit",
          stock: initialData.stock || "",
          isEstimationEnabled: initialData.isEstimationEnabled || false,
          isActive:
            initialData.isActive !== undefined ? initialData.isActive : true,
          hasVariations: initialData.hasVariations || false,
          variations: initialData.variations || [],
          image: initialData.image || [],
        });
      } else {
        setExistingImages([]);
        setNewFiles([]);
        reset({
          name: "",
          categoryId: "",
          description: "",
          type: "recyclable",
          price: "",
          unit: "unit",
          stock: "",
          isEstimationEnabled: false,
          isActive: true,
          hasVariations: false,
          variations: [],
          image: [],
        });
      }
      setVarName("");
      setVarPrice("");
    }
  }, [isOpen, reset ,initialData, isCategoriesLoading]);

  const addVariation = () => {
    clearErrors("variations");
    if (!varName || !varPrice) {
      setError("variations", {
        type: "manual",
        message: "Atleast add one variation",
      });
      return;
    }
    const newVar = { name: varName, price: parseFloat(varPrice) };
    setValue("variations", [...currentVariations, newVar], {
      shouldDirty: true,
    });
    setVarName("");
    setVarPrice("");
    clearErrors("variations");
  };

  const removeVariation = (index) => {
    const updated = currentVariations.filter((_, i) => i !== index);
    setValue("variations", updated, { shouldDirty: true });
  };

  const handleModalSubmit = (data) => {
    const formData = new FormData();

    // Prepare Data Copy to handle Price
    let submitData = { ...data };

    if (submitData.hasVariations) {
      const lowestPrice = Math.min(
        ...submitData.variations.map((v) => Number(v.price)),
      );
      submitData.price = lowestPrice;
    }
    console.log(submitData, "without stringyfy");
    formData.append("existingImages", JSON.stringify(existingImages));
    newFiles.forEach((file) => formData.append("image", file));
    Object.keys(submitData).forEach((key) => {
      if (key !== "image") {
        if (key === "variations") {
          formData.append(key, JSON.stringify(submitData[key]));
        } else if (submitData[key] !== undefined && submitData[key] !== null) {
          formData.append(key, submitData[key]);
        }
      }
    });
    console.log(Object.fromEntries(formData.entries()), "withStringyfy");
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 shrink-0">
          <h3 className="text-xl font-bold text-slate-800">
            {initialData ? "Edit Item" : "Add New Item"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 custom-scrollbar">
          <form
            id="inventory-form"
            onSubmit={handleSubmit(handleModalSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Item Name
                </label>
                <input
                  {...register("name", { required: "Item name is required" })}
                  type="text"
                  placeholder="e.g. Sofa, Mattress (Generic Name)"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? "border-red-500 focus:ring-red-50"
                      : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5"
                  }`}
                />
                {errors.name && (
                  <p className="text-[10px] text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Category
                </label>
                <div className="relative">
                  <select
                    {...register("categoryId", {
                      required: "Category is required",
                    })}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 bg-white ${
                      errors.categoryId
                        ? "border-red-500 focus:ring-red-50"
                        : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5"
                    }`}
                  >
                    <option value="">Select a category...</option>
                    {isCategoriesLoading ? (
                      <option disabled>Loading categories...</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {errors.categoryId && (
                  <p className="text-[10px] text-red-500">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Description
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                })}
                rows="3"
                placeholder="Provide details about the item (e.g. condition, accepted types)..."
                className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/5 resize-none
                      ${errors.categoryId ? "border-red-500 focus:ring-red-50" : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5"}`}
              />
              {errors.description && (
                <p className="text-[10px] text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Item Type & Business Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["recyclable", "junk", "store"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("type", type)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1.5 ${
                      itemType === type
                        ? type === "recyclable"
                          ? "border-emerald-500 bg-emerald-50/50 text-emerald-700"
                          : type === "store"
                            ? "border-blue-500 bg-blue-50/50 text-blue-700"
                            : "border-slate-800 bg-slate-50 text-slate-800"
                        : "border-gray-100 hover:border-gray-200 text-gray-500"
                    }`}
                  >
                    {type === "recyclable" && <Recycle size={20} />}
                    {type === "junk" && <Trash size={20} />}
                    {type === "store" && <ShoppingBag size={20} />}
                    <div className="text-center">
                      <span className="block text-xs font-bold capitalize">
                        {type === "junk"
                          ? "Pay"
                          : type === "recyclable"
                            ? "Earn"
                            : "Store"}
                      </span>
                      <span className="block text-[10px] opacity-70 capitalize">
                        {type === "junk"
                          ? "Junk Removal"
                          : type === "recyclable"
                            ? "Recyclables"
                            : "Sell Items"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-slate-600" />
                  <span className="text-sm font-bold text-slate-700">
                    Has Variations?
                  </span>
                </div>
                <div
                  onClick={() => setValue("hasVariations", !hasVariations)}
                  className={`w-10 h-5 rounded-full cursor-pointer transition-colors duration-200 flex items-center p-0.5 ${
                    hasVariations ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      hasVariations ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {hasVariations ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">
                        Variation Name (e.g. 3-Seater)
                      </label>
                      <input
                        type="text"
                        value={varName}
                        onChange={(e) => setVarName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                        placeholder="Type name..."
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">
                        Price
                      </label>
                      <input
                        type="number"
                        value={varPrice}
                        onChange={(e) => setVarPrice(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                        placeholder="0.00"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addVariation}
                      className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700"
                    >
                      Add
                    </button>
                  </div>
                  {errors.variations && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                      <Info size={12} /> {errors.variations.message}
                    </p>
                  )}

                  {currentVariations.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {currentVariations.map((v, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-white p-2 rounded border text-xs"
                        >
                          <span className="font-medium text-slate-700">
                            {v.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-600">
                              ₹{v.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeVariation(idx)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 italic">
                    Base price will be automatically set to the lowest variation
                    price.
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400">
                  Enable this if the item has different sizes or types (e.g.
                  2-Seater vs 3-Seater) with different prices.
                </p>
              )}
            </div>

            {!hasVariations && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Base Price / Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                      ₹
                    </span>
                    <input
                      {...register("price", {
                        required: !hasVariations ? "Price is required" : false,
                        min: 0,
                      })}
                      type="number"
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.price
                          ? "border-red-500 focus:ring-red-50"
                          : "border-gray-200 focus:border-emerald-500/50 focus:ring-emerald-500/5"
                      }`}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-[10px] text-red-500">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Unit Type
                  </label>
                  <select
                    {...register("unit")}
                    disabled={isEstimationEnabled}
                    className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/5 ${
                      isEstimationEnabled
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <option value="kg">Per Kg (Weight)</option>
                    <option value="unit">Per Unit (Item)</option>
                    <option value="bag">Per Bag (Volume)</option>
                  </select>
                  {isEstimationEnabled ? (
                    <p className="text-[10px] text-emerald-600 font-medium">
                      Locked to 'Kg' because estimation is enabled.
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400">
                      Select pricing model (e.g. ₹12/kg).
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              {itemType === "store" && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold text-slate-700">
                    Opening Stock Quantity
                  </label>
                  <div className="relative">
                    <input
                      {...register("stock", {
                        required:
                          itemType === "store" ? "Stock is required" : false,
                      })}
                      type="number"
                      placeholder="e.g. 50"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                      items
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-500 font-medium flex items-center gap-1">
                    <Info size={12} /> Track inventory for items you sell.
                  </p>
                </div>
              )}

              {itemType === "recyclable" && (
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="mt-1">
                    <Info size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-slate-800">
                        Allow "Bag Count" Input?
                      </p>
                      <div
                        onClick={() => {
                          const newState = !isEstimationEnabled;
                          setValue("isEstimationEnabled", newState);
                          if (newState) setValue("unit", "kg");
                        }}
                        className={`w-10 h-5 rounded-full cursor-pointer transition-colors duration-200 flex items-center p-0.5 ${
                          isEstimationEnabled ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                            isEstimationEnabled
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </div>
                      <input
                        type="checkbox"
                        {...register("isEstimationEnabled")}
                        className="hidden"
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      If ON: Users see <b>"Select Bag Size"</b> instead of
                      "Enter Kg".
                    </p>
                  </div>
                </div>
              )}

              {itemType === "junk" && (
                <p className="text-[10px] text-gray-400 text-center italic">
                  Service items usually have unlimited stock.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">
                  Item Images
                  {/* <span className="text-red-500">*</span> */}
                </label>
                <span
                  className={`text-[10px] font-bold ${imageList.length >= 4 ? "text-emerald-600" : "text-red-500"}`}
                >
                  {imageList.length} uploaded (Min 4 required)
                </span>
              </div>

              <div className="h-56">
                <ImageDropzone
                  value={[...existingImages, ...newFiles]}
                  multiple={true}
                  onChange={(updatedList) => {
                    const freshUploads = updatedList.filter(
                      (item) => item instanceof File,
                    );

                    if (freshUploads.length > newFiles.length) {
                      // Open cropper for the latest file
                      setCropImage(freshUploads[freshUploads.length - 1]);
                      setIsCropModalOpen(true);
                    } else {
                      // It was a deletion
                      const remainingExisting = updatedList.filter(
                        (item) => typeof item === "string",
                      );
                      setNewFiles(freshUploads);
                      setExistingImages(remainingExisting);
                      setValue("image", updatedList, { shouldValidate: true });
                    }
                  }}
                />
              </div>
              {/* {errors.image && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                      <Info size={12} /> {errors.image.message}
                  </p>
              )} */}
              <p className="text-[10px] text-gray-400">
                Upload minimum 4 images representing the item.
              </p>
            </div>

            <div
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => setValue("isActive", !isActiveStatus)}
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  isActiveStatus
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-white border-gray-300"
                }`}
              >
                {isActiveStatus && (
                  <Check size={14} className="text-white" strokeWidth={3} />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">
                  Set as Active
                </span>
                <span className="text-[10px] text-gray-500">
                  Item will be visible in the catalog immediately.
                </span>
              </div>
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
            form="inventory-form"
            type="submit"
            disabled={imageList.length < 4 || isSubmitting}
            className={`px-6 py-2.5 text-white text-sm font-bold rounded-lg transition-all shadow-md flex items-center gap-2 ${
              imageList.length < 4 || isSubmitting
                ? "bg-emerald-300 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 active:scale-95"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                {initialData ? "Updating Item.." : "Saving New Item..."}
              </>
            ) : (
              <>
                <Check size={16} />
                {initialData ? "Update Item" : "Save New Item"}
              </>
            )}
          </button>
        </div>
        {isCropModalOpen && (
          <ImageCropModal
            file={cropImage}
            onCancel={() => setIsCropModalOpen(false)}
            onComplete={(croppedFile) => {
              const updatedFiles = [...newFiles, croppedFile];
              setNewFiles(updatedFiles);
              setValue("image", [...existingImages, ...updatedFiles], {
                shouldValidate: true,
              });
              setIsCropModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProductModal;
