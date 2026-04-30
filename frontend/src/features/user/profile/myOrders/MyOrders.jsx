import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Download, ChevronRight, Package, Loader2, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../../../api/axiosInstance';
import Pagination from '../../../../components/common/Pagination';
import StatusBadge from './components/StatusBadge';

const MyOrders = () => {
  // const isPickupMode = mode === 'pickup';
  // const pageTitle = isPickupMode ? 'My Pickups' : 'My Orders';
  
  const [activeTab, setActiveTab] = useState('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const res = await api.get('/order/my-orders');
      return res.data.orders || [];
    },
  });
  console.log(orders)
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  if (isError) {
    return (
        <div className="text-center py-10 text-red-500">
            Failed to load data. Please try again later.
        </div>
    );
  }


  // const filteredByType = orders.filter(order => {
  //     const hasStoreItems = order.items?.some(item => item.productId?.type === 'store');
  //     const hasPickupItems = order.items?.some(item => item.productId?.type !== 'store');
  //     return isPickupMode ? hasPickupItems : hasStoreItems;
  // });

  const getStatusFilter = (order) => {
    const s1 = order.status;        
    const s2 = order.pickupStatus;  
    switch (activeTab) {
      case 'Active': 
        return ['Placed', 'Confirmed', 'Shipped'].includes(s1) || 
               ['Pending', 'Agent Assigned', 'Out for Pickup'].includes(s2);
      case 'Completed': return s2 === 'Completed';
      case 'Delivered': return s1 === 'Delivered';
      case 'Cancelled': return s1 === 'Cancelled' || s2 === 'Cancelled';
      case 'Returned': return s1 === 'Returned';
      default: return true; 
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = getStatusFilter(order);

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      order.orderId?.toString().toLowerCase().includes(searchLower) ||
      order.items?.some(item => item.name?.toLowerCase().includes(searchLower));

    return matchesTab && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginationData = { pagination: { currentPage, totalPages } };
  const tabs = ['All Orders', 'Active', 'Completed' ,'Delivered', 'Cancelled', 'Returned'].filter(Boolean);
  
  const isPayout = orders?.pricing?.totalAmount < 0;
  const displayAmount = Math.abs(orders?.pricing?.totalAmount || 0);
  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 font-sans text-gray-800">
      
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">My Orders</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      </div>

      <div className="relative mb-8">
        <input 
          type="text" 
          placeholder='Search Orders...'
          value={searchQuery}
          onChange={(e) =>{ setSearchQuery(e.target.value); setCurrentPage(1)}}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      <div className="flex items-center gap-8 border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => {setActiveTab(tab); setCurrentPage(1)}}
            className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

    
      <div className="space-y-4">
        {currentOrders.length > 0 ? (
          currentOrders.map(order => {
            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                
               
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-bold text-gray-900 font-mono">{order.orderId}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      
                      {/* {(
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                  <Calendar size={12} />
                                  <span className="font-medium">
                                      {new Date(order.pickupDate).toLocaleDateString()}
                                  </span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2 py-1 rounded-md">
                                  <Clock size={12} />
                                  <span className="font-medium">{order.pickupTimeSlot}</span>
                              </div>
                          </div>
                      )} */}
                  </div>

                  {/* <StatusBadge status={ order.status} /> */}
                </div>
 
                <div className="space-y-4">
                  {order.items.map((item, idx) => {
                     const imgSrc = item.image || (item.productId?.image && item.productId.image[0]);

                     return (
                      <div key={idx} className="flex items-center gap-4 group">
                        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {imgSrc ? (
                            <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="text-gray-300" size={24} />
                          )}
                        </div>

                        <div className="grow">
                          <h4 className="font-bold text-gray-800 text-sm group-hover:text-emerald-600 transition-colors">
                             {item.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {item.quantity}x
                            </span>
                            { (
                                <span className={`text-[10px] uppercase font-bold ${item.productId?.type == "junk" ?"text-gray-800" : " text-emerald-600"} border border-gray-200 px-1.5 rounded`}>
                                    {item.productId?.type}
                                </span>
                            )}
                          </div>
                        </div>

                        <div className="text-sm font-bold text-gray-900">
                           {item.productId?.type == "recyclable" ?`Est. ₹${item.price}` : `₹${item.price}`}
                        </div>
                      </div>
                     );
                  })}
                </div>

                <div className="flex flex-wrap justify-between items-end gap-4 mt-4 pt-4 border-t border-gray-50">
                  <div>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        {order?.pricing?.totalAmount<=0 ? 'Earnings' : 'Order Total'}
                    </span>
                    <p className={`text-lg font-extrabold mt-0.5 ${order?.pricing?.totalAmount<=0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {Math.abs(order?.pricing?.totalAmount || 0)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Link 
                      to={`/profile/order/${encodeURIComponent(order.orderId)}`}
                      className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors inline-block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <EmptyState title="No orders found" />
        )}
      </div>
          
      <Pagination data={paginationData} page={currentPage} setPage={setCurrentPage} />
    </div>
  );
};

const EmptyState = ({ title }) => (
  <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
    <Package className="mx-auto text-gray-300 mb-3" size={40} />
    <h3 className="text-gray-900 font-bold mb-1">{title}</h3>
    <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
  </div>
);

export default MyOrders;
