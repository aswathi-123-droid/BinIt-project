const StatusBadge = ({ status }) => {
  const styles = {
    'Delivered': 'bg-emerald-50 text-emerald-600',
    'Completed': 'bg-emerald-50 text-emerald-600',
    'Scheduled': 'bg-blue-50 text-blue-600',
    'Placed': 'bg-orange-50 text-orange-600',
    'Confirmed':'bg-orange-50 text-orange-600 border-orange-100',
    'Cancelled': 'bg-red-50 text-red-600',
    'Returned': 'bg-orange-50 text-orange-600',
    'Shipped': 'bg-blue-50 text-blue-600',
    'Pending': 'bg-orange-50 text-orange-600',
    'Return Pending': 'bg-orange-50 text-orange-600',
    'Agent Assigned': 'bg-blue-50 text-blue-600',
    'Out for Pickup': 'bg-purple-50 text-purple-600'
  };

  const defaultStyle = 'bg-gray-50 text-gray-600';

  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${styles[status] || defaultStyle}`}>
      {status}
    </span>
  );
};

export default StatusBadge;