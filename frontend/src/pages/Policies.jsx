import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

function StatusBadge({ status }) {
  const styles = {
    active: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    expired: "bg-slate-200 text-slate-600",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function Policies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchPolicies = (status = "") => {
    setLoading(true);
    api
      .get(`/api/policies?status=${status}`)
      .then((response) => setPolicies(response.data.data))
      .catch(() => setError("Could not load policies."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    fetchPolicies(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <h2 className="text-xl font-semibold text-slate-800">Policies</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            View and manage insurance policies
          </p>
        </header>

        <div className="p-8">
          <div className="mb-5">
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {loading && <p className="text-slate-500 text-sm">Loading policies...</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {!loading && !error && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Policy No.</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Customer</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Type</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Premium</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">End Date</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-slate-400">
                        No policies found.
                      </td>
                    </tr>
                  )}
                  {policies.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3 text-slate-800 font-medium">{p.policy_number}</td>
                      <td className="px-5 py-3 text-slate-600">{p.customer_name}</td>
                      <td className="px-5 py-3 text-slate-600">{p.policy_type}</td>
                      <td className="px-5 py-3 text-slate-600">₹{p.premium_amount}</td>
                      <td className="px-5 py-3 text-slate-600">{p.end_date}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Policies;