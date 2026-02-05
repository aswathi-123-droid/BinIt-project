import { Box, Container, ShoppingBag, X } from "lucide-react";

const EstimationModal = ({ product, isOpen, onClose, onAddToCart }) => {
  if (!isOpen || !product) return null;

  const bagSizes = [
    { id: 'small', name: 'Small Bag', label: 'Grocery Bag', weight: 2, icon: ShoppingBag },
    { id: 'medium', name: 'Medium Bag', label: 'Garbage Bag', weight: 8, icon: Container },
    { id: 'large', name: 'Large Bag', label: 'Gunny/Sack', weight: 20, icon: Box },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Select Bag Size</h3>
            <p className="text-xs text-gray-500">Estimate for {product.name} (@ ₹{product.price}/kg)</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 grid gap-3">
          {bagSizes.map((size) => {
            const estimatedPrice = product.price * size.weight;
            return (
              <div key={size.id} className="group flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <size.icon size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{size.name}</p>
                    <p className="text-[10px] text-gray-400">{size.label} (~{size.weight} kg)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block font-bold text-emerald-600">₹{estimatedPrice}</span>
                    <span className="block text-[9px] text-gray-400">Est. Total</span>
                  </div>
                  <button 
                    onClick={() => { 
                      onAddToCart(product, { 
                        type: 'estimation', 
                        data: { name: size.name, price: estimatedPrice, weight: size.weight } 
                      }); 
                      onClose(); 
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-6 py-3 bg-slate-50 text-[10px] text-slate-400 text-center">
          Final weight may vary during pickup. This is an estimate.
        </div>
      </div>
    </div>
  );
};

export default EstimationModal;