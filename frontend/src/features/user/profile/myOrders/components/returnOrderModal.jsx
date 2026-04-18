import React, { useState } from "react";
import { X, AlertCircle, RotateCcw, Loader2 } from "lucide-react";

const RETURN_REASONS = [
  "Item was damaged or defective",
  "Received wrong item",
  "Item doesn't match the description",
  "Quality was not as expected",
  "Missing parts or accessories",
  "Other",
];

const ReturnOrderModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  isReturning,
}) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason =
      selectedReason === "Other" ? otherReason : selectedReason;
    if (!finalReason.trim()) return;

    onConfirm({ reason: finalReason });
  };

  const isFormValid =
    selectedReason &&
    (selectedReason !== "Other" || otherReason.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <RotateCcw size={20} className="text-blue-500" />
            <h3 className="font-bold text-lg">Return Order</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className=" bg-blue-50 text-blue-700 p-3 rounded-xl mb-6 text-sm flex items-start gap-2 border border-blue-100">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-blue-500" />
            <p>
              You are requesting a return for Order <strong>#{orderId}</strong>.
              Please tell us why you want to return these items.
            </p>
          </div>

          <form id="return-form" onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Reason for return <span className="text-red-500">*</span>
            </label>

            <div className="space-y-2">
              {RETURN_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="returnReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => {
                      setSelectedReason(e.target.value);
                      if (e.target.value !== "Other") setOtherReason("");
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span
                    className={`text-sm ${selectedReason === reason ? "font-bold text-blue-800" : "text-gray-600"} select-none`}
                  >
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            {selectedReason === "Other" && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Please specify your reason here..."
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                  required
                />
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end items-center">
          <button
            type="button"
            onClick={onClose}
            disabled={isReturning}
            className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            form="return-form"
            type="submit"
            disabled={!isFormValid || isReturning}
            className="px-5 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
          >
            {isReturning ? (
              <Loader2 size={16} className="animate-spin" />
            ) : null}
            {isReturning ? "Submitting..." : "Submit Return Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnOrderModal;
