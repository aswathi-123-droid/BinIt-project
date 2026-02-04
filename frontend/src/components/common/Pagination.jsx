import React from 'react'

function Pagination({data,setPage,page}) {
  return (
        <div className="p-6 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border border-gray-100 text-xs font-bold text-gray-400 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page === data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border border-emerald-500 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
   
  )
}

export default Pagination
