  const VariationView = ({product,selectedVariation,setSelectedVariation}) => (
    <div className="space-y-4">
      <p className="text-xs font-medium text-gray-400">Choose one to proceed</p>
      <div className="flex flex-wrap gap-2">
        {product.variations?.map((v) => (
          <button
            key={v._id}
            onClick={() => setSelectedVariation(v)}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${selectedVariation?._id === v._id ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-200"}`}
          >
            {v.name} • ₹{v.price}
          </button>
        ))}
      </div>
    </div>
  );

  export default VariationView;