import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import { 
  Home, 
  Briefcase, 
  MapPin, 
  Phone, 
  Plus, 
  Edit2, 
  Trash2, 
  X 
} from 'lucide-react';
import AddressModal from './AddressModal';
import { api } from '../../../../api/axiosInstance';
import toast from 'react-hot-toast';



const MyAddresses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const queryClient=useQueryClient();

  const {data:addresses,isLoading,error}=useQuery({
    queryKey:["address"],
    queryFn:async()=>{
      const res = await api.get("/address");
      return res.data.data
    }
  })

  const addressMutation= useMutation({
    mutationFn:async(data)=>{
      let res;
      if(editingAddress){
      
         res = await api.patch(`/address/${editingAddress._id}`,data)
           console.log(res)
      }else{
        res = await api.post("/address",data)
      }
      
      return res.data
    },
    onSuccess:(data)=>{
      toast.success("successfull")
      queryClient.invalidateQueries(["address"])
    },
    onError:(error)=>{
      toast.error(error)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async(addressId) => {

      const res = await api.delete(`/address/${addressId}`)
      console.log(res)
      return res.data

    },
    onSuccess:(data)=>{
      alert("successfull")
      queryClient.invalidateQueries(["address"])
    },
    onError:(error)=>{
      alert(error?.response?.message)
    }
  })


    const defaultMutation = useMutation({
    mutationFn: async(addressId) => {

      const res = await api.patch(`/address/${addressId}`,{isDefault:true})
      console.log(res)
      return res.data

    },
    onSuccess:(data)=>{
     
      queryClient.invalidateQueries(["address"])
    },
    onError:(error)=>{
      alert(error)
    }
  })


  if(isLoading){
    return <h1>loading....</h1>
  }

  
  const getIcon = (type) => {
    switch (type) {
      case 'Home': return <Home size={18} />;
      case 'Work': return <Briefcase size={18} />;
      default: return <MapPin size={18} />;
    }
  };

 
  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (addr) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      deleteMutation.mutate(id)
    }
  };

  const handleSetDefault = (id) => {
     defaultMutation.mutate(id)
  };

  const handleFormSubmit = async(data) => {
    try{
      if(editingAddress) {
        delete data.label

       addressMutation.mutate(data)
      }else{
        addressMutation.mutate(data)
        alert("Address added successfully")
      }
      setIsModalOpen(false);
    }catch(err){
        alert(err)
    }
  };

  return (
    <div className="flex-1 bg-white min-h-screen p-4 sm:p-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Addresses</h1>
          <p className="text-sm text-gray-500 mt-1">
            View, edit, or add your pickup and delivery addresses.
          </p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Add New Address
        </button>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        <div className="col-span-full">
          <h2 className="text-base font-bold text-slate-800">Your Saved Addresses</h2>
        </div>

        {addresses.map((addr) => (
          <div 
            key={addr._id} 
            className={`relative p-6 rounded-2xl border transition-all duration-200 group hover:shadow-md ${
              addr.isDefault 
                ? 'border-emerald-200 bg-emerald-50/10 ring-1 ring-emerald-500/20' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-slate-700">
                <div className={`p-2 rounded-lg ${addr.isDefault ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {getIcon(addr.type)}
                </div>
                <span className="font-bold text-sm">
                  {addr.type === 'Other' && addr.customLabel ? addr.customLabel : addr.type}
                </span>
              </div>
              
              {addr.isDefault && (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Default
                </span>
              )}
            </div>

            <div className="space-y-1 mb-6 min-h-25">
              <h3 className="text-sm font-bold text-slate-900">{addr.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {addr.flat}, {addr.street}, {addr.locality}, {addr.city}, {addr.state}, {addr.pincode}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium pt-2">
                <Phone size={14} className="text-gray-400" />
                {addr.phone}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100/80">
              <button 
                onClick={() => handleEdit(addr)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
              >
                <Edit2 size={14} /> Edit
              </button>

              <div className="flex items-center gap-4">
                {!addr.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    Set as Default
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(addr._id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
  
          </div>
        ))}
      </div>

      <AddressModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFormSubmit}
        initialData={editingAddress}
      />

    </div>
  );
};

export default MyAddresses;