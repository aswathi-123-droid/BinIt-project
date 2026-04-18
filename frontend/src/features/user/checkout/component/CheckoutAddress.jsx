import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Home,
  Briefcase,
  MapPin,
  Plus,
  Edit2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";
import { api } from "../../../../api/axiosInstance";
import AddressModal from "../../profile/myAddresses/AddressModal";
import toast from "react-hot-toast";
import { useEffect } from "react";

const CheckoutAddress = ({ onNext, onBack }) => {
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const queryClient = useQueryClient();

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data;
    },
  });

  const requiresPickup = cartData?.cart?.items?.some(
    (item) =>
      item.productId.type === "junk" || item.productId.type === "recyclable",
  );

  const getNext7Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }), 
        date: d.getDate(), 
        fullDate: d.toISOString(), 
      });
    }
    return dates;
  };

   const availableDates = React.useMemo(() => getNext7Days(), []);
  const timeSlots = [
    "09:00 AM - 12:00 PM",
    "12:00 PM - 03:00 PM",
    "03:00 PM - 06:00 PM",
  ];

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["address"],
    queryFn: async () => {
      const res = await api.get("/address");
      return res.data.data;
    },
  });

  useEffect(() => {
  if (addresses && addresses.length > 0 && !selectedAddressId) {
    setSelectedAddressId(addresses[0]._id);
  }
}, [addresses, selectedAddressId]);

  const addressMutation = useMutation({
    mutationFn: async (data) => {
      let res;
      if (editingAddress) {
        res = await api.patch(`/address/${editingAddress._id}`, data);
      } else {
        res = await api.post("/address", data);
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success(editingAddress ? "Address updated" : "Address added");
      queryClient.invalidateQueries(["address"]);
      setIsModalOpen(false);
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save address");
    },
  });

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (e, addr) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (editingAddress) delete data.label;
    addressMutation.mutate(data);
  };

  const handleProceed = () => {
    if (!selectedAddressId) {
      toast.error("Please select an address.");
      return;
    }

    if (requiresPickup && (!selectedDate || !selectedTimeSlot)) {
      toast.error("Please select a pickup date and time.");
      return;
    }

    if (onNext)
      onNext({
        addressId: selectedAddressId,
        pickupDate: requiresPickup ? selectedDate : null,
        pickupTimeSlot: requiresPickup ? selectedTimeSlot : null,
      });
  };

  const getIcon = (type) => {
    switch (type) {
      case "Home":
        return <Home size={18} />;
      case "Work":
        return <Briefcase size={18} />;
      default:
        return <MapPin size={18} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Step 2: Select Pickup Address
        </h2>
        <p className="text-gray-500 mt-1">
          Choose where you would like us to collect your items.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {addresses?.map((addr) => (
          <div
            key={addr._id}
            onClick={() => setSelectedAddressId(addr._id)}
            className={`cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-200 group ${
              selectedAddressId === addr._id
                ? "border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20 scale-[1.02]"
                : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg hover:-translate-y-1"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${selectedAddressId === addr._id ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}
                >
                  {getIcon(addr.type)}
                </div>
                <span
                  className={`font-bold transition-colors ${selectedAddressId === addr._id ? "text-emerald-900" : "text-gray-700"}`}
                >
                  {addr.type === "Other" && addr.customLabel
                    ? addr.customLabel
                    : addr.type}
                </span>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  selectedAddressId === addr._id
                    ? "border-emerald-500 bg-emerald-500 shadow-sm"
                    : "border-gray-200 bg-transparent"
                }`}
              >
                {selectedAddressId === addr._id && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-in zoom-in" />
                )}
              </div>
            </div>
            <div className="space-y-1 mb-2 pl-1">
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {addr.flat}, {addr.street},<br />
                {addr.locality}, {addr.city} - {addr.pincode}
              </p>
            </div>
            <button
              onClick={(e) => handleEdit(e, addr)}
              className="absolute top-6 right-14 text-gray-300 hover:text-emerald-600 p-1.5 rounded-full hover:bg-emerald-50 transition-all opacity-0 group-hover:opacity-100"
              title="Edit Address"
            >
              <Edit2 size={16} />
            </button>
          </div>
        ))}

        <button
          onClick={handleAddNew}
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/10 transition-all group min-h-45 hover:shadow-md"
        >
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4 group-hover:bg-emerald-100 group-hover:text-emerald-500 transition-colors shadow-sm group-hover:scale-110 duration-300">
            <Plus size={28} />
          </div>
          <span className="font-bold text-gray-500 group-hover:text-emerald-600 transition-colors">
            Add New Address
          </span>
        </button>
      </div>

      {requiresPickup && (
        <div className="mb-8 pt-8 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Schedule Pickup
          </h2>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-emerald-500" /> Select Date
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {availableDates.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(item.fullDate)}
                  className={`min-w-20 p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                  selectedDate === item.fullDate
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-600'
                }}`}
                >
                  <span className="text-xs font-medium uppercase opacity-80">
                    {item.day}
                  </span>
                  <span className="text-xl font-bold">{item.date}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-emerald-500" /> Select Time Slot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                    selectedTimeSlot === slot
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500"
                      : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-600"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-8 border-t border-gray-100 gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-all w-full sm:w-auto justify-center"
        >
          <ArrowLeft size={18} /> Back 
        </button>

        <button
          onClick={handleProceed}
          className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg w-full sm:w-auto ${
            selectedAddressId &&
            (!requiresPickup || (selectedDate && selectedTimeSlot))
              ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 hover:shadow-emerald-300 transform hover:-translate-y-0.5 active:scale-95"
              : "bg-gray-300 cursor-not-allowed shadow-none grayscale opacity-70"
          }`}
        >
          Proceed to Payment <ArrowRight size={18} />
        </button>
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

export default CheckoutAddress;
