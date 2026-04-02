import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/axiosInstance';
import { Search, ChevronDown, Plus, Edit, Trash, Lock, Unlock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import CouponModal from './CouponModal';
import Pagination from '../../../components/common/Pagination';

const CouponManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState(""); 
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: async () => {
      const res = await api.get('/admin/coupons');
      return res.data?.data || res.data || [];
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/coupons/${id}/status`),
    onSuccess: () => {
        toast.success("Status updated!");
        queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
        toast.success("Coupon deleted!");
        queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    }
  });

  const processedCoupons = useMemo(() => {
    let result = [...coupons];

    if (searchInput) {
      const lowerSearch = searchInput.toLowerCase();
      result = result.filter(c => 
        c.code.toLowerCase().includes(lowerSearch) || 
        c.description?.toLowerCase().includes(lowerSearch)
      );
    }

    if (status === "active") result = result.filter(c => c.isActive);
    if (status === "inactive") result = result.filter(c => !c.isActive);

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "highest") return b.discountValue - a.discountValue;
      if (sortBy === "lowest") return a.discountValue - b.discountValue;
      return 0;
    });

    return result;
  }, [coupons, searchInput, status, sortBy]);

  const totalPages = Math.ceil(processedCoupons.length / itemsPerPage);
  const currentCoupons = processedCoupons.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
           <p className="text-sm text-gray-500 mt-1">Manage active discounts and promotional codes</p>
        </div>
        <button 
            onClick={handleAddNew}
            className="bg-emerald-600 hover:bg-emerald-700 transition-colors text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-sm"
        >
          <Plus size={18} /> Add New Coupon
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by code or description..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {searchInput && (
            <button 
               onClick={() => { setSearchInput(''); setPage(1); }}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="relative min-w-35">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative min-w-42.5">
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Discount</option>
            <option value="lowest">Lowest Discount</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Coupon Name</th>
                  <th className="px-6 py-4 font-semibold">Discount</th>
                  <th className="px-6 py-4 font-semibold">Min Purchase</th>
                  <th className="px-6 py-4 font-semibold">Expiry Date</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {isLoading ? (
                    <tr><td colSpan="6" className="text-center py-10 text-gray-400">Loading coupons...</td></tr>
                ) : currentCoupons.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-gray-400">
                         {searchInput || status ? "No coupons matched your filters." : "No coupons created yet."}
                      </td>
                    </tr>
                ) : (
                    currentCoupons.map(coupon => {
                        const isExpired = new Date(coupon.expiryDate) < new Date();
                        
                        return (
                          <tr key={coupon._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                               <div className="font-black text-emerald-800 tracking-wide uppercase">{coupon.code}</div>
                               <div className="text-xs text-gray-400 mt-1 truncate max-w-50">{coupon.description}</div>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">
                                {coupon.discountType === 'percent' ? (
                                    <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">{coupon.discountValue}% OFF</span>
                                ) : (
                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">₹{coupon.discountValue} OFF</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-medium">₹{coupon.minPurchaseAmount || 0}</td>
                            <td className="px-6 py-4">
                               <span className={`font-medium ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>
                                  {new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                               </span>
                               {isExpired && <span className="block text-[10px] text-red-500 font-bold uppercase mt-0.5">Expired</span>}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex ${coupon.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                {coupon.isActive ? "Active" : "Disabled"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleEdit(coupon)}
                                  className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Edit Coupon"
                                >
                                   <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => toggleMutation.mutate(coupon._id)}
                                  className={`p-2 rounded-lg transition-colors ${coupon.isActive ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                                  title={coupon.isActive ? "Disable Coupon" : "Activate Coupon"}
                                >
                                   {coupon.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                                </button>
                                <button 
                                  onClick={() => {
                                     if(window.confirm('Are you sure you want to permanently delete this coupon?')) {
                                         deleteMutation.mutate(coupon._id);
                                     }
                                  }}
                                  className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Delete Coupon"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                    })
                )}
              </tbody>
            </table>
          </div>
      </div>

      {!isLoading && totalPages > 1 && (
        <Pagination 
           page={page} 
           totalPages={totalPages} 
           setPage={setPage} 
        />
      )}

      {isModalOpen && (
          <CouponModal 
             isOpen={isModalOpen} 
             onClose={() => setIsModalOpen(false)} 
             initialData={selectedCoupon}
             refetch={() => queryClient.invalidateQueries({ queryKey: ["adminCoupons"] })}
          />
      )}
    </div>
  );
};

export default CouponManagement;
