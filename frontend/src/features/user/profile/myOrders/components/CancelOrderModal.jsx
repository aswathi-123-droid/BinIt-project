import React, { useState } from 'react';
import { X } from 'lucide-react';

const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderId, isCancelling }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [otherReason, setOtherReason] = useState('');

    if (!isOpen) return null;

    const reasons = [
        "Changed my mind",
        "Found another service",
        "Wrong items selected",
        "Rescheduled elsewhere",
        "Other (please specify)"
    ];

    const handleSubmit = () => {
        const finalReason = selectedReason === "Other (please specify)" ? otherReason : selectedReason;
        if (finalReason) {
            onConfirm(finalReason);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-125 p-8 relative shadow-xl transform transition-all scale-100">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-extrabold text-gray-900">Cancel Order Request</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    Please tell us why you are canceling your order <span className="font-bold text-gray-900">#{orderId}</span>.
                </p>

                {/* Radio Group */}
                <div className="space-y-4 mb-6">
                    {reasons.map((reason) => (
                        <div 
                            key={reason} 
                            className="flex items-center gap-3 cursor-pointer group" 
                            onClick={() => setSelectedReason(reason)}
                        >
                            <div className={`
                                w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all duration-200
                                ${selectedReason === reason ? 'border-emerald-500' : 'border-gray-200 group-hover:border-emerald-200'}
                            `}>
                                <div className={`
                                    w-2.5 h-2.5 rounded-full bg-emerald-500 transition-transform duration-200 
                                    ${selectedReason === reason ? 'scale-100' : 'scale-0'}
                                `} />
                            </div>
                            <span className={`text-sm ${selectedReason === reason ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                {reason}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Text Area for Other */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${selectedReason === "Other (please specify)" ? 'max-h-40 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
                     <textarea 
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-700 placeholder:text-gray-400 resize-none bg-gray-50"
                        placeholder="Optional: Provide more details..."
                        rows={3}
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                     />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-2">
                    <button 
                        onClick={onClose}
                        disabled={isCancelling}
                        className="px-6 py-2.5 rounded-xl border border-gray-200 font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Keep Order
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!selectedReason || isCancelling || (selectedReason === "Other (please specify)" && !otherReason.trim())}
                        className="px-6 py-2.5 rounded-xl bg-[#DC2626] font-bold text-sm text-white hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
                    >
                        {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelOrderModal;