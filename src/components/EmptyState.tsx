export default function EmptyState() {
  return (
    <div className="text-center py-10 px-6 text-gray-600 border border-gray-200 rounded-lg bg-gray-50">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No advocates found</h3>
      <p className="text-sm text-gray-500">Try adjusting your search terms or click "Reset Search" to see all advocates.</p>
    </div>
  );
} 