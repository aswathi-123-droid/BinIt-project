import { AlertCircle, X } from "lucide-react";

const VariationModal = ({ product, isOpen, onClose, onAddToCart }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Select Options</h3>
            <p className="text-xs text-gray-500">For {product.name}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
          {product.variations && product.variations.length > 0 ? (
            product.variations.map((variant) => (
              <div key={variant._id} className="group flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-200 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-700 text-sm">{variant.name}</p>
                  <p className="text-[10px] text-gray-400">Fixed Price</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-600">₹{variant.price}</span>
                  <button 
                    onClick={() => { onAddToCart(product, { type: 'variation', data: variant }); onClose(); }}
                    className="px-3 py-1.5 bg-white border border-gray-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 flex flex-col items-center">
              <AlertCircle size={32} className="mb-2 opacity-50"/>
              <p className="text-xs">No options available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariationModal;