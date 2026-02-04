import { ChevronDown } from "lucide-react";

  const DefaultView = ({product,quantity,setQuantity}) => (
    <div className="space-y-4">
      <p className="text-xs font-bold text-gray-400 uppercase">
        Quantity {product.unit}
      </p>
      <div className="relative w-24">
        <select
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2 top-3 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );

  export default DefaultView;