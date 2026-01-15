import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  Wallet,
  Search,
  ChevronDown,
  Lock,
  Unlock,
  X
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/axiosInstance";
import Pagination from "../../../components/admin/Pagination";

const UserManagement = () => {
  // Stat data from provided UI 
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const [searchInput,setSearchInput]=useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", searchInput, page, status],
    queryFn: async () => {
      const res = await api.get("/admin/users", {
        params: {search:searchInput, page, status, limit: 2 },
      });
      console.log(res);
      return res.data;
    },
    keepPreviousData: true,
  });

  useEffect(()=>{
   let id= setTimeout(()=>{
         setSearchInput(search);
    },500)
   
    return ()=> clearTimeout(id)
  },[search])

  const toggleBlockMutation = useMutation({
    mutationFn:async({userId,isBlocked}) => {
      const res = await api.patch(`/admin/users/${userId}/stats`,{isBlocked:!isBlocked})
      return res.data
    },
    onSuccess: ()=>{
      queryClient.invalidateQueries(["users"]);
    },
    onError:(error)=>{
      alert(error)
    }
  });

  const handleToggleBlock = (user) => {
    if (window.confirm(`Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} ${user.name}?`)) {
      toggleBlockMutation.mutate({ userId: user._id, isBlocked: user.isBlocked });
    }
  };

  const stats = [
    {
      label: "Total Users",
      value: data?.userStats?.totalUsersCount,
      icon: Users,
      color: "text-gray-400",
      bg: "bg-white",
    },
    {
      label: "Active Users",
      value: data?.userStats?.activeUsers,
      icon: UserCheck,
      color: "text-emerald-500",
      bg: "bg-white",
    },
    {
      label: "New Users This Month",
      value: data?.userStats?.userThisMonth,
      icon: UserPlus,
      color: "text-blue-500",
      bg: "bg-white",
    },
    {
      label: "Users with Pending Payouts",
      value: "120",
      icon: Wallet,
      color: "text-orange-500",
      bg: "bg-white",
    },
  ];

  if (isError)
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Error: {error.message}
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* Stats Grid (Static for now) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filter Controls */}
        <div className="p-6 border-b border-gray-50 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setStatus("")}
              className={`px-4 py-2 text-xs font-bold rounded-md ${
                status === ""
                  ? "bg-emerald-500 text-white"
                  : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setStatus("active")}
              className={`px-4 py-2 text-xs font-bold rounded-md ${
                status === "active"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatus("blocked")}
              className={`px-4 py-2 text-xs font-bold rounded-md ${
                status === "blocked"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              Blocked
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full max-w-md">
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
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {search && (
                <button
                  onClick={() => setSearch("")} // Requirement ii: Clear/Cancel Button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-medium text-slate-700">
              {!isLoading && data.users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4 text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {user.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        !user.isBlocked
                          ? "bg-emerald-50 text-emerald-600 w-20"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          !user.isBlocked ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      ></span>

                      {/* Status Text */}
                      {!user.isBlocked ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleBlock(user)}
                      className="p-2 text-slate-800 hover:bg-gray-100 rounded-lg transition-colors"
                      title={user.isBlocked ? "Unblock User" : "Block User"}
                    >
                      {user.isBlocked ? (
                        <Unlock size={16} />
                      ) : (
                        <Lock size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {!isLoading && <Pagination data={data} setPage={setPage} page={page}></Pagination>}
      </div>
    </div>
  );
};

export default UserManagement;
