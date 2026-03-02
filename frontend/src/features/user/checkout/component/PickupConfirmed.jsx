/* frontend/src/features/user/checkout/component/PickupConfirmed.jsx */
import React from 'react';
import { CheckCircle, Calendar, Clock, MapPin, Package, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PickupConfirmed = ({ orderDetails }) => {
  const navigate = useNavigate();

  
  const order = orderDetails || {
    id: "#ORD-89421",
    date: "Oct 27, 2023",
    time: "1:00 PM - 4:00 PM",
    address: "123, Green Street, Kerala, India - 673001",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-4 animate-in zoom-in duration-500">
      
    
      <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <CheckCircle className="text-emerald-500 w-12 h-12" strokeWidth={3} />
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
        Order Placed Successfully!
      </h1>
      <p className="text-gray-500 text-center max-w-md mb-8">
        Your pickup has been scheduled. A confirmation email has been sent to you.
      </p>

      
      <div className="bg-gray-50 rounded-2xl p-6 w-full max-w-md border border-gray-100 shadow-sm mb-8">
        
        
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-500 font-medium text-sm">Order ID</span>
          <span className="font-bold text-gray-900">{order.id}</span>
        </div>

     
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-500 font-medium text-sm">Scheduled Date</span>
          <span className="font-bold text-gray-900 text-right">{order.date}</span>
        </div>

        
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-500 font-medium text-sm">Time Slot</span>
          <span className="font-bold text-gray-900 text-right">{order.time}</span>
        </div>

       
        <div className="pt-4">
          <span className="text-gray-500 font-medium text-sm block mb-1">Pickup Address</span>
          <p className="font-bold text-gray-900 text-sm leading-relaxed">
            {order.address}
          </p>
        </div>
      </div>

      
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button 
          onClick={() => navigate('/my-pickups')}
          className="bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
        >
          View My Pickups
        </button>
        
        <button className="flex items-center justify-center gap-2 border-2 border-emerald-500 text-emerald-600 font-bold py-3.5 px-6 rounded-xl hover:bg-emerald-50 transition-colors">
          <Download size={18} /> Download Invoice
        </button>

        <button 
          onClick={() => navigate('/')}
          className="text-gray-400 font-medium text-sm hover:text-gray-600 mt-2"
        >
          Back to Home
        </button>
      </div>

    </div>
  );
};

export default PickupConfirmed;