export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <button className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800">
          Add Customer
        </button>
      </div>

      <div className="border rounded-lg">
        <div className="p-6">
          <p className="text-slate-600">Customer management interface coming soon.</p>
          <p className="text-sm text-slate-500 mt-2">
            This will include customer accounts, settings, and integrations.
          </p>
        </div>
      </div>
    </div>
  );
}


