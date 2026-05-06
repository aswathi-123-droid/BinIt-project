import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Clock,
  Truck,
  CheckCircle2,
  ShoppingBag,
  Package,
  Download,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/common/Pagination";
import StatusBadge from "../../user/profile/myOrders/components/StatusBadge";

const AdminOrderManagement = ({ mode = "order" }) => {
  const isPickupMode = mode === "pickup";
  const pageTitle = isPickupMode ? "Pickup Management" : "Order Management";
  const itemLabel = isPickupMode ? "Pickups" : "Orders";

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const navigate = useNavigate();
  useEffect(() => {
    let id = setTimeout(() => {
      setSearchInput(search);
    }, 500);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      isPickupMode ? "admin_pickups" : "admin_orders",
      searchInput,
      page,
      statusFilter,
      sortBy,
    ],
    queryFn: async () => {
      const endpoint = isPickupMode
        ? "/admin/order/pickups"
        : "/admin/order/orders";
      const res = await api.get(endpoint, {
        params: { search: searchInput, page, statusFilter, sortBy, limit: 5 },
      });
      return res.data;
    },
    keepPreviousData: true,
    onError: () => {
      toast.error(`Failed to load ${itemLabel.toLowerCase()}`);
    },
  });

  const stats = [
    {
      label: `Total ${itemLabel}`,
      value: data?.stats?.totalCount || "0",
      icon: isPickupMode ? Package : ShoppingBag,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: isPickupMode ? "Pending" : "Placed",
      value: data?.stats?.placedCount || "0",
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-50",
      valueColor: "text-orange-500",
    },
    {
      label: isPickupMode ? "Out for Pickup" : "Shipped",
      value: data?.stats?.inTransitCount || "0",
      icon: Truck,
      color: "text-blue-600",
      bg: "bg-blue-50",
      valueColor: "text-blue-500",
    },
    {
      label: isPickupMode ? "Completed" : "Delivered",
      value: data?.stats?.deliveredCount || "0",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      valueColor: "text-emerald-500",
    },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {stat.label}
              </p>
              <h3
                className={`text-2xl font-extrabold ${stat.valueColor || "text-slate-800"}`}
              >
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded w-12 animate-pulse mt-1"></div>
                ) : (
                  stat.value
                )}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} strokeWidth={2.5} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-125">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={`Search ${itemLabel.toLowerCase()} ID, customer...`}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
              <div className="relative border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2 bg-white min-w-40 cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-500">
                  Filter by{" "}
                  <span className="text-slate-700 font-semibold capitalize">
                    {!statusFilter ? "Status" : statusFilter}
                  </span>
                </span>
                <ChevronDown size={16} className="text-gray-400 ml-auto" />
                <select
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value={isPickupMode ? "Pending" : "Placed"}>
                    {isPickupMode ? "Pending" : "Placed"}
                  </option>
                  <option value={isPickupMode ? "Agent Assigned" : "Confirmed"}>
                    {isPickupMode ? "Agent Assigned" : "Confirmed"}
                  </option>
                  <option value={isPickupMode ? "Out for Pickup" : "Shipped"}>
                    {isPickupMode ? "Out for Pickup" : "Shipped"}
                  </option>
                  <option value={isPickupMode ? "Completed" : "Delivered"}>
                    {isPickupMode ? "Completed" : "Delivered"}
                  </option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="relative border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2 bg-white min-w-40 cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm font-semibold text-slate-700 capitalize">
                  {sortBy === "newest"
                    ? "Newest First"
                    : sortBy === "oldest"
                      ? "Oldest First"
                      : "Amount"}
                </span>
                <ChevronDown size={16} className="text-gray-400 ml-auto" />
                <select
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount_desc">Amount: High to Low</option>
                  <option value="amount_asc">Amount: Low to High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto  h-90">
          {isLoading ? (
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                  <th className="px-6 py-4">S.NO</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-center">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {[...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="h-4 bg-gray-200 rounded w-6"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-100 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-100 rounded w-40"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-8 bg-gray-200 rounded-lg w-24 mx-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                  <th className="px-6 py-4">S.NO</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-center">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium text-slate-700 bg-white">
                {data?.items?.length > 0 ? (
                  data.items.map((order, index) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5 text-gray-500 font-semibold">
                        {(page - 1) * 10 + (index + 1)}
                      </td>

                      <td className="px-6 py-5 font-bold text-slate-800">
                        {order.orderId || order._id}
                      </td>

                      <td className="px-6 py-5 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        ,{" "}
                        {new Date(order.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 leading-tight">
                            {order.userId?.name || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5">
                            {order.userId?.email || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 font-bold text-slate-800 text-center">
                        ₹
                        {order.pricing?.totalAmount?.toLocaleString("en-IN") ||
                          0}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center">
                          <StatusBadge
                            status={
                              isPickupMode ? order.pickupStatus : order.status
                            }
                          />
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/${isPickupMode ? "pickups" : "orders"}/${order._id}`,
                            )
                          }
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm shadow-emerald-200"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No {itemLabel.toLowerCase()} found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="pl-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
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

export default AdminOrderManagement;
