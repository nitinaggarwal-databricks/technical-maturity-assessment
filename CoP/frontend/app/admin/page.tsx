export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Customers</h3>
          <p className="text-sm text-slate-600 mb-4">Manage customer accounts</p>
          <a href="/admin/customers" className="text-sm text-slate-900 font-medium hover:underline">
            View Customers →
          </a>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">CoPs</h3>
          <p className="text-sm text-slate-600 mb-4">Manage all CoPs</p>
          <a href="/admin/cops" className="text-sm text-slate-900 font-medium hover:underline">
            View CoPs →
          </a>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Users</h3>
          <p className="text-sm text-slate-600 mb-4">Manage user accounts</p>
          <a href="/admin/users" className="text-sm text-slate-900 font-medium hover:underline">
            View Users →
          </a>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-sm text-slate-600">
          <p>• 2 new CoPs created this week</p>
          <p>• 15 active users</p>
          <p>• 8 surveys completed</p>
        </div>
      </div>
    </div>
  );
}
