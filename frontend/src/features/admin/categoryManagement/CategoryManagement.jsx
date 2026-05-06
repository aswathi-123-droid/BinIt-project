import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  X,
  Plus,
  Edit,
  Layers,
  Recycle,
  Trash,
  Lock,
  Unlock,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/axiosInstance";
import Pagination from "../../../components/common/Pagination";
import CategoryModal from "./CategoryModal";
import OfferModal from "./OfferModal";
import toast from "react-hot-toast";

const CategoryManagement = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [searchInput, setSearchInput] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [categoryName, setCategoryName] = useState(null);

  useEffect(() => {
    let id = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories", search, page, status, type, sortBy],
    queryFn: async () => {
      const res = await api.get("/admin/categories", {
        params: { search, page, status, type, sortBy, limit: 5 },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const categoryMutation = useMutation({
    mutationFn: async (formData) => {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (editingCategory) {
        await api.patch(
          `/admin/categories/${editingCategory._id}`,
          formData,
          config,
        );
      } else {
        await api.post("/admin/categories", formData, config);
      }
    },
    onSuccess: () => {
      toast.success(
        editingCategory
          ? "Category Updated Successfully"
          : "Category Added Successfully",
      );
      queryClient.invalidateQueries(["categories"]);
      setIsModalOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    },
  });

  const offerMutation = useMutation({
    mutationFn: async ({ categoryId, data }) => {
      let res;
      if (editingOffer) {
        res = await api.put(`/admin/categories/${categoryId}/offer`, data);
      } else {
        res = await api.post(`/admin/categories/${categoryId}/offer`, data);
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Offer Saved Successfully!");
      queryClient.invalidateQueries(["categories"]);
      setIsOfferModalOpen(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to save offer"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ categoryId }) => {
      const res = await api.patch(`/admin/categories/${categoryId}/status`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries(["categories"]);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleToggleStatus = (category) => {
    if (
      window.confirm(
        `Are you sure you want to ${category.isActive ? "deactivate" : "activate"} ${category.name}?`,
      )
    ) {
      toggleStatusMutation.mutate({ categoryId: category._id });
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleAddNewOffer = (category) => {
    setEditingOffer(null);
    setCategoryName(category);
    setIsOfferModalOpen(true);
  };

  const handleEditOffer = (category) => {
    setEditingOffer(category.offer);
    setCategoryName(category);
    setIsOfferModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      categoryMutation.mutate(data);
    } catch (err) {
      alert(err);
    }
  };

  const handleOfferFormSubmit = async (data) => {
    if (categoryName) {
      offerMutation.mutate({ categoryId: categoryName._id, data });
    }
  };

  const stats = [
    {
      label: "Total Categories",
      value: data?.stats?.totalCount || "0",
      icon: Layers,
      color: "text-slate-400",
    },
    {
      label: "Recyclable (Earn)",
      value: data?.stats?.recyclableCount || "0",
      icon: Recycle,
      color: "text-emerald-500",
    },
    {
      label: "Junk Removal (Pay)",
      value: data?.stats?.junkCount || "0",
      icon: Trash,
      color: "text-slate-700",
    },
    {
      label: "Store Items (Buy)",
      value: data?.stats?.storeCount || "0",
      icon: ShoppingBag,
      color: "text-blue-500",
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
                {" "}
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded w-12 animate-pulse mt-1"></div>
                ) : (
                  stat.value
                )}
              </h3>
            </div>
            <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 space-y-4">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="relative border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 bg-white min-w-37.5">
                <span className="text-xs font-medium text-gray-500">
                  Type:{" "}
                  <span className="text-slate-700">
                    {type
                      ? type === "recyclable"
                        ? "Earn"
                        : type === "store"
                          ? "Store"
                          : "Pay"
                      : "All"}
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

              <div className="relative border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 bg-white min-w-40">
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
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="items_desc">Most Items</option>
                  <option value="items_asc">Fewest Items</option>
                </select>
              </div>

              <div className="relative border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 bg-white min-w-35">
                <span className="text-xs font-medium text-gray-500">
                  Status:{" "}
                  <span className="text-slate-700">
                    {status
                      ? status === "true"
                        ? "Active"
                        : "Inactive"
                      : "All"}
                  </span>
                </span>
                <ChevronDown size={14} className="text-gray-400 ml-auto" />
                <select
                  onChange={(e) => setStatus(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
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
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                {search && (
                  <button
                    onClick={() => setSearchInput("")}
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
                <Plus size={16} /> Add Category
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">S.NO</th>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Type (Earn/Pay/Buy)</th>
                <th className="px-6 py-4">No. of Items</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-medium text-slate-700">
              {isLoading ? (
                <>
                  {/* Generates 5 fake skeleton rows */}
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-6"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4 pl-10">
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* 3 fake action buttons */}
                          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                data?.categories?.map((category, index) => (
                  <tr
                    key={category._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {(page - 1) * 2 + (index + 1)}
                    </td>
                    <td className="px-6 py-4 font-semibold">{category.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          category.type === "recyclable"
                            ? "bg-emerald-50 text-emerald-600"
                            : category.type === "store"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {category.type === "recyclable"
                          ? "Earn"
                          : category.type === "store"
                            ? "Buy"
                            : "Pay"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-bold pl-10">
                      {category.itemCount || 0}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {category.createdAt
                        ? new Date(category.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold w-fit ${
                          category.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${category.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                        ></span>
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {(category.type === "junk" ||
                          category.type === "store") && (
                          <button
                            onClick={() =>
                              category.offer && category.offer.isActive
                                ? handleEditOffer(category)
                                : handleAddNewOffer(category)
                            }
                            className={`p-2 rounded-lg transition-all ${
                              category.offer?.isActive
                                ? "text-emerald-500 bg-emerald-50 hover:bg-emerald-100"
                                : "text-slate-400 hover:text-blue-500 hover:bg-blue-50"
                            }`}
                            title={
                              category.offer?.isActive
                                ? "Edit Active Offer"
                                : "Add Offer"
                            }
                          >
                            <Tag size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handleEditClick(category)}
                          className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(category)}
                          className={`p-2 rounded-lg transition-all ${category.isActive ? "text-slate-400 hover:text-red-500 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                          title={category.isActive ? "Deactivate" : "Activate"}
                        >
                          {category.isActive ? (
                            <Lock size={16} />
                          ) : (
                            <Unlock size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingCategory}
          isSubmitting={categoryMutation.isPending}
        />

        <OfferModal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          onSubmit={handleOfferFormSubmit}
          initialData={editingOffer}
          categoryName={categoryName?.name}
        />

        <div className="p-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            Showing {data?.categories?.length || 0} of{" "}
            {data?.pagination?.totalCount || 0} categories
          </p>
          {!isLoading && data && (
            <Pagination data={data} setPage={setPage} page={page} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
