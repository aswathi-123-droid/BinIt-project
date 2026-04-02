
import React, { useState } from 'react';
import UploadTrash from "./component/UploadTrash";
import CheckoutAddress from "./component/CheckoutAddress";
import CheckoutPayment from "./component/CheckoutPayment";
import PickupConfirmed from "./component/PickupConfirmed";
import { CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
      addressId: null,
      pickupDate: null,
      pickupTimeSlot: null,
      paymentMethod: null
  });

  const { mutate: placeOrder, isPending } = useMutation({
  mutationFn: async(payload) => {
        const response = await api.post("/order/create", payload);
        return response.data
    },
    onSuccess: (data) => {
        const order = data.order;

        const formattedOrder = {
          id: order.orderId,
          date: order.pickupDate ? new Date(order.pickupDate).toLocaleDateString() : new Date().toLocaleDateString(),
          time: order.pickupTimeSlot || "N/A",
          address: order.pickupAddress ? `${order.pickupAddress.street}, ${order.pickupAddress.city} - ${order.pickupAddress.pincode}` : "N/A",
          fullOrder: order
        };

        setCheckoutData(prev => ({ ...prev, orderDetails: formattedOrder }));

        queryClient.invalidateQueries({ queryKey: ['cart'] });

        toast.success("Order Placed Successfully!");
        window.scrollTo(0, 0);
        setCurrentStep(4);
    },
    onError: (error) => {
        console.error("Order placement failed", error);
        toast.error(error.response?.data?.message || "Failed to place order. Please try again.");
    }
  })

  const handleImagesUploaded = () => {
      window.scrollTo(0, 0);
      setCurrentStep(2);
  };


  const handleAddressSelected = (data) => {
      setCheckoutData(prev => ({ ...prev, ...data }));
      window.scrollTo(0, 0);
      setCurrentStep(3);
  };


  const handleOrderConfirmed = (paymentData) => {
    //   console.log("Final Order Data:", { ...checkoutData, ...paymentData });

    //   setCheckoutData(prev => ({ ...prev, ...paymentData }));
    //   window.scrollTo(0, 0);
    //   setCurrentStep(4);
    const payload = {
        addressId: checkoutData.addressId,
        pickupDate: checkoutData.pickupDate,
        pickupTimeSlot: checkoutData.pickupTimeSlot,
        paymentMethod: paymentData.paymentMethod,
        useWallet: paymentData.useWallet,
        couponCode: paymentData.couponCode
    };
    placeOrder(payload)
  };

  const handlePrevStep = () => {
      if(currentStep > 1) {
        window.scrollTo(0, 0);
        setCurrentStep(prev => prev - 1);
      }
  };

  const steps = [
      { id: 1, label: "Images" },
      { id: 2, label: "Address" },
      { id: 3, label: "Payment" },
      { id: 4, label: "Confirm" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {currentStep < 4 && (
            <div className="mb-12 max-w-4xl mx-auto">
            <div className="relative flex items-center justify-between">
              
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 -z-10"></div>
                <div 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-emerald-500 -z-10 transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center bg-white px-2">
                    <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all duration-300 ${
                        step.id < currentStep
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                        : step.id === currentStep
                        ? "bg-emerald-500 text-white ring-4 ring-emerald-50"
                        : "bg-white border-2 border-gray-100 text-gray-300"
                    }`}
                    >
                    {step.id < currentStep ? <CheckCircle size={18} /> : step.id}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors ${step.id <= currentStep ? "text-emerald-600" : "text-gray-300"}`}>
                    {step.label}
                    </span>
                </div>
                ))}
            </div>
            </div>
        )}

        <div className="mt-8">
            {currentStep === 1 && (
                <UploadTrash onNext={handleImagesUploaded} />
            )}

            {currentStep === 2 && (
                <CheckoutAddress 
                    onNext={handleAddressSelected} 
                    onBack={handlePrevStep} 
                />
            )}

            {currentStep === 3 && (
                <CheckoutPayment 
                    onConfirm={handleOrderConfirmed}
                    onBack={handlePrevStep}
                />
            )}

            {currentStep === 4 && (
                <PickupConfirmed orderDetails={checkoutData.orderDetails}/>
            )}
        </div>

      </main>
    </div>
  );
};

export default CheckoutPage;