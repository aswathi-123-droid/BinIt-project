import React, { useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, X, AlertCircle, ShoppingBag, Box, Container } from 'lucide-react';
import UserSidebar from './components/Sidebar';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api/axiosInstance';
import VariationModal from './components/VariationModal';
import EstimationModal from './components/EstimationModal';
import Pagination from '../../../components/common/Pagination';
import { useNavigate } from 'react-router-dom';



const ServiceListing = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState("");
  const [sortBy,setSortBy] = useState("");
  const [filters, setFilters] = useState("")
  const [page, setPage] = useState(1)
  console.log(filters)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isVarModalOpen, setIsVarModalOpen] = useState(false);
  const [isEstModalOpen, setIsEstModalOpen] = useState(false);


  const { data, isLoading } = useQuery({
    queryKey: ["user-listing", search , sortBy, page, filters], 
    queryFn: async () => {
      const res = await api.get("/products", {
        params: { search, limit: 8,sortBy, page, ...filters, isActive: true } 
      }); 
      return res.data; 
    }, 
    staleTime: 5 * 60 * 1000, 
  });
   console.log(data)
  const handleItemAction = (e, item) => {
    e.stopPropagation()
    if (item.hasVariations) {
      setSelectedProduct(item);
      setIsVarModalOpen(true);
    } else if (item.isEstimationEnabled) {
      setSelectedProduct(item);
      setIsEstModalOpen(true);
    } else {
      handleAddToCart(item, null);
    }
  };

  const handleAddToCart = (product, selection) => {
    let finalItem = {
      productId: product._id,
      image: product.image?.[0],
      type: product.type,
      unit: product.unit
    };


    if (selection?.type === 'variation') {
      finalItem.name = `${product.name} (${selection.data.name})`;
      finalItem.price = selection.data.price;
    } else if (selection?.type === 'estimation') {
      finalItem.name = `${product.name} (${selection.data.name})`;
      finalItem.price = selection.data.price;
      finalItem.estimatedWeight = selection.data.weight; // Optional: store estimated weight
    } else {
      finalItem.name = product.name;
      finalItem.price = product.price;
    }
    
    console.log("Adding to Cart:", finalItem);
    alert(`Added ${finalItem.name} - ₹${finalItem.price} to cart!`);
  };

  return (
    <div className='flex'>
      <UserSidebar onFilterChange={(newFilters) => setFilters(newFilters)}/>
      
      <div className="flex-1 bg-gray-50 min-h-screen p-6 font-sans">
      
        <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-8">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => {setSearch(e.target.value); setPage(1)}}
              placeholder="Search for newspaper, sofa, bottles..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 bg-white min-w-30">
                <span className="text-xs font-medium text-gray-500">Sort By</span>
                <ChevronDown size={14} className="text-gray-400 ml-auto" />
                <select onChange={(e) => setSortBy(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">
                  <option value="price_asc">Price Low-High</option>
                  <option value="price_desc">Price High-Low</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                </select>
          </div>
        </div>

        {isLoading ? (
           <div className="flex justify-center pt-20 text-gray-400">Loading services...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {data?.items?.filter(item=>item.categoryId.isActive).map((item) => (
              <div key={item._id}
               onClick={()=>{navigate(`/services/product/${item._id}`)}}
               className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">

                <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                  <img 
                    src={item.image?.[0] || "https://placehold.co/400x300?text=No+Image"} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      item.type === 'recyclable' ? 'bg-emerald-500' : item.type === 'junk' ? 'bg-slate-800' : 'bg-blue-500'
                    }`}></div>
                    <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tighter">
                      {item.type === 'recyclable' ? 'Recycle' : item.type === 'junk' ? 'Service' : 'Store'}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wide mb-2">
                      {item.categoryId?.name || "General"}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-8">
                      {item.description || "No description available."}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase">
                        {item.type === 'recyclable' ? 'You Earn' : 'Fees'}
                      </p>
                      <p className={`text-sm font-bold ${item.type === 'recyclable' ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {item.hasVariations ? (
                           <span>From ₹{item.price}<span className="text-[10px] font-normal text-gray-400">/ {item.unit}</span></span>
                        ) : (
                           <span>₹{item.price} <span className="text-[10px] font-normal text-gray-400">/ {item.unit}</span></span>
                        )}
                      </p>
                    </div>

                    <button 
                      onClick={(e) => handleItemAction(e,item)}
                      className={`px-4 py-1.5 text-sm font-bold rounded-lg shadow-sm transition-colors border ${
                        item.hasVariations || item.isEstimationEnabled
                        ? 'bg-slate-800 text-white hover:bg-slate-700 border-transparent' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                      }`}
                    >
                      {item.hasVariations ? "Customize" : item.isEstimationEnabled ? "Add Bag" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <VariationModal 
          isOpen={isVarModalOpen}
          product={selectedProduct}
          onClose={() => { setIsVarModalOpen(false); setSelectedProduct(null); }}
          onAddToCart={handleAddToCart}
        />
        
        <EstimationModal 
          isOpen={isEstModalOpen}
          product={selectedProduct}
          onClose={() => { setIsEstModalOpen(false); setSelectedProduct(null); }}
          onAddToCart={handleAddToCart}
        />

        <div className="p-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between ">
           <p className="text-xs text-gray-400">
             Showing {data?.items?.length || 0} of {data?.pagination?.totalItems || 0} items
           </p>
           {!isLoading && data && <Pagination data={data} setPage={setPage} page={page} />}
        </div>

      </div>
    </div>
  );
};

export default ServiceListing;

