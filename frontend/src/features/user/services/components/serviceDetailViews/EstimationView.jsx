import { ShoppingBasket } from "lucide-react";

  const EstimateView = ({product,setSelectedBag,selectedBag}) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs font-semibold text-gray-500 uppercase">
        <span>Estimate by bag size</span>
        <span className="text-emerald-600 cursor-pointer">Select One</span>
      </div>
      {[
        {
          id: "small",
          label: "Small Bag",
          weight: "~5 kg approx",
          price: product.price * 5,
        },
        {
          id: "medium",
          label: "Medium Bag",
          weight: "~10 kg approx",
          price: product.price * 10,
        },
        {
          id: "large",
          label: "Large Bag",
          weight: "~20 kg approx",
          price: product.price * 20,
        },
      ].map((bag) => (
        <div
          key={bag.id}
          onClick={() => setSelectedBag(bag.id)}
          className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${selectedBag === bag.id ? "border-emerald-500 bg-emerald-50" : "border-gray-200"}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${selectedBag === bag.id ? "bg-emerald-100 text-emerald-600" : "bg-gray-100"}`}
            >
              <ShoppingBasket size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-800">{bag.label}</p>
              <p className="text-xs text-gray-500">{bag.weight}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold">₹{bag.price}</span>
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedBag === bag.id ? "border-emerald-500" : "border-gray-300"}`}
            >
              {selectedBag === bag.id && (
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  export default EstimateView;