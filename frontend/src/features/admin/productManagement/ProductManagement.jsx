import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  X,
  Plus,
  Edit,
  Trash,
  Recycle,
  Package,
  ShoppingBag,
  Lock,
  Unlock,
  AlertCircle,
  Tag,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/axiosInstance";
import Pagination from "../../../components/common/Pagination";
import ProductModal from "./ProductModal";
import toast from "react-hot-toast";
import OfferModal from "../categoryManagement/OfferModal";
import { calculateOfferPrice } from "../../../utils/helpers";

const ProductManagement = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerItem, setOfferItem] = useState(null);

  useEffect(() => {
    let id = setTimeout(() => {
      setSearchInput(search);
    }, 500);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", searchInput, page, type, stockStatus, sortBy],
    queryFn: async () => {
      const res = await api.get("/admin/products", {
        params: {
          search: searchInput,
          page,
          type,
          stockStatus,
          sortBy,
          limit: 2,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const productMutation = useMutation({
    mutationFn: async (formData) => {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (editingItem) {
        console.log(editingItem, "kii");
        await api.patch(`/admin/products/${editingItem._id}`, formData, config);
      } else {
        await api.post("/admin/products", formData, config);
      }
    },
    onSuccess: () => {
      toast.success(
        editingItem ? "Item Updated Successfully" : "Item Added Successfully",
      );
      queryClient.invalidateQueries(["products"]);
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ itemId }) => {
      const res = await api.patch(`/admin/products/${itemId}/status`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("status updated Successfully");
      queryClient.invalidateQueries(["products"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update status"),
  });

  const offerMutation = useMutation({
    mutationFn: async (offerData) => {
      await api.put(`/admin/products/${offerItem._id}/offer`, offerData);
    },
    onSuccess: () => {
      toast.success("Offer Updated Successfully");
      queryClient.invalidateQueries(["products"]);
      setIsOfferModalOpen(false);
      setOfferItem(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update offer");
    },
  });
  const handleOfferClick = (item) => {
    setOfferItem(item);
    setIsOfferModalOpen(true);
  };
  const handleOfferSubmit = (data) => {
    offerMutation.mutate(data);
  };

  const handleToggleStatus = (item) => {
    if (
      window.confirm(
        `Are you sure you want to ${item.isActive ? "deactivate" : "activate"} ${item.name}?`,
      )
    ) {
      toggleStatusMutation.mutate({ itemId: item._id });
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      productMutation.mutate(data);
    } catch (err) {
      alert(err);
    }
  };

  const stats = [
    {
      label: "Total Items Listed",
      value: data?.stats?.totalCount || "0",
      icon: Package,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
    {
      label: "Recyclable Items",
      value: data?.stats?.recyclableCount || "0",
      icon: Recycle,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Junk Removal Items",
      value: data?.stats?.junkCount || "0",
      icon: Trash,
      color: "text-slate-700",
      bg: "bg-slate-50",
    },
    {
      label: "Store Items",
      value: data?.stats?.storeCount || "0",
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
  ];

  if (isError)
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Error: {error.message}
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stat.value}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 space-y-4">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="relative border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 bg-white min-w-40">
                <span className="text-xs font-medium text-gray-500">
                  Type:{" "}
                  <span className="text-slate-700">
                    {!type
                      ? "All Types"
                      : type === "store"
                        ? "Store"
                        : type === "recyclable"
                          ? "Earn"
                          : "Pay"}
                  </span>
                </span>
                <ChevronDown size={14} className="text-gray-400 ml-auto" />
                <select
                  onChange={(e) => setType(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  <option value="">All Types</option>
                  <option value="recyclable">Earn (Recyclable)</option>
                  <option value="junk">Pay (Junk)</option>
                  <option value="store">Store (Buy)</option>
                </select>
              </div>

              <div className="relative border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 bg-white min-w-37.5">
                <span className="text-xs font-medium text-gray-500">
                  Stock:{" "}
                  <span className="text-slate-700">
                    {!stockStatus
                      ? "All"
                      : stockStatus === "in_stock"
                        ? "In Stock"
                        : "Out of Stock"}
                  </span>
                </span>
                <ChevronDown size={14} className="text-gray-400 ml-auto" />
                <select
                  onChange={(e) => setStockStatus(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  <option value="">All</option>
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              <div className="relative border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 bg-white min-w-42.5">
                <span className="text-xs font-medium text-gray-500">
                  Sort By
                </span>
                <ChevronDown size={14} className="text-gray-400 ml-auto" />
                <select
                  onChange={(e) => setSortBy(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  <option value="newest">Newest Added</option>
                  <option value="oldest">Oldest Added</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
              <div className="relative w-full sm:w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={handleAddNew}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all shadow-md active:scale-95"
              >
                <Plus size={16} /> Add New Item
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">S.NO</th>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Price / Unit</th>
                <th className="px-6 py-4">Stock / Info</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-medium text-slate-700">
              {!isLoading &&
                data?.items?.map((item, index) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {(page - 1) * 2 + (index + 1)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{item.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {item.categoryId?.name || "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.type === "recyclable"
                            ? "bg-emerald-50 text-emerald-600"
                            : item.type === "store"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.type === "recyclable"
                          ? "Earn"
                          : item.type === "store"
                            ? "Buy"
                            : "Pay"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.offer &&
                      item.offer.isActive &&
                      new Date(item.offer.expiryDate) > new Date() ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 line-through text-xs font-semibold">
                              ₹{item.price}
                            </span>
                            <span className="bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
                              {item.offer.discountType === "percent"
                                ? `${item.offer.value}% OFF`
                                : `₹${item.offer.value} OFF`}
                            </span>
                          </div>
                          <div className="font-black text-emerald-600 text-sm">
                            ₹
                            {calculateOfferPrice(
                              item.price,
                              item.offer,
                            ).toFixed(2)}
                            <span className="text-gray-400 font-normal text-[10px] ml-1">
                              / {item.unit}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="font-bold text-slate-800">
                          ₹{item.price}{" "}
                          <span className="text-gray-400 font-normal text-[10px]">
                            / {item.unit}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {item.type === "store" ? (
                        item.stock > 0 ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            {item.stock} in stock
                          </span>
                        ) : (
                          <span className="text-red-500 font-bold flex items-center gap-1">
                            <AlertCircle size={12} /> Out of Stock
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold w-fit ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                        ></span>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {item.type === "store" && (
                          <button
                            onClick={() => handleOfferClick(item)}
                            className={`p-2 rounded-lg transition-all ${
                              item.offer?.isActive
                                ? "text-emerald-500 bg-emerald-50 hover:bg-emerald-100"
                                : "text-slate-400 hover:text-blue-500 hover:bg-blue-50"
                            }`}
                            title={
                              item.offer?.isActive
                                ? "Edit Active Offer"
                                : "Add Offer"
                            }
                          >
                            <Tag size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Edit Item"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`p-2 rounded-lg transition-all ${item.isActive ? "text-slate-400 hover:text-red-500 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                          title={item.isActive ? "Deactivate" : "Activate"}
                        >
                          {item.isActive ? (
                            <Lock size={16} />
                          ) : (
                            <Unlock size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <ProductModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialData={editingItem}
            onSubmit={handleFormSubmit}
            isSubmitting={productMutation.isPending}
          />
        )}

        {isOfferModalOpen && offerItem && (
          <OfferModal
            isOpen={isOfferModalOpen}
            onClose={() => {
              setIsOfferModalOpen(false);
              setOfferItem(null);
            }}
            initialData={offerItem.offer}
            onSubmit={handleOfferSubmit}
            categoryName={offerItem}
            isSubmitting={offerMutation.isPending}
          />
        )}

        <div className="p-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            Showing {data?.items?.length || 0} of{" "}
            {data?.pagination?.totalCount || 0} items
          </p>
          {!isLoading && data && (
            <Pagination data={data} setPage={setPage} page={page} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
