import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { Plus, X } from "lucide-react";

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

function CreatePolicyModal({ customers, onClose, onCreated }) {
  const [form, setForm] = useState({
    customer_id: "",
    policy_type: "",
    policy_number: "",
    premium_amount: "",
    start_date: "",
    end_date: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/api/policies", {
        ...form,
        premium_amount: parseFloat(form.premium_amount),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Could not create policy.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Policy</h3>

        {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Customer</label>
            <select name="customer_id" value={form.customer_id} onChange={handleChange} required
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Policy Type</label>
            <input type="text" name="policy_type" value={form.policy_type} onChange={handleChange} required
              placeholder="e.g. Health Insurance"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Policy Number</label>
            <input type="text" name="policy_number" value={form.policy_number} onChange={handleChange} required
              placeholder="e.g. POL-2026-005"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Premium Amount (₹)</label>
            <input type="number" name="premium_amount" value={form.premium_amount} onChange={handleChange} required min="1" step="0.01"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Start Date</label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">End Date</label>
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-slate-800 text-white py-2 rounded-md text-sm hover:bg-slate-900 transition disabled:opacity-50 mt-2">
            {saving ? "Creating..." : "Create Policy"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Policies() {
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchPolicies = (status = "") => {
    setLoading(true);
    api
      .get(`/api/policies?status=${status}`)
      .then((response) => setPolicies(response.data.data))
      .catch(() => setError("Could not load policies."))
      .finally(() => setLoading(false));
  };

  const fetchCustomers = () => {
    api.get("/api/customers").then((response) => setCustomers(response.data.data));
  };

  useEffect(() => {
    fetchPolicies();
    fetchCustomers();
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
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Policies</h2>
            <p className="text-sm text-slate-500 mt-0.5">View and manage insurance policies</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
          >
            <Plus size={16} /> New Policy
          </button>
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
                      <td colSpan="6" className="text-center py-6 text-slate-400">No policies found.</td>
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

        {showModal && (
          <CreatePolicyModal
            customers={customers}
            onClose={() => setShowModal(false)}
            onCreated={() => fetchPolicies(statusFilter)}
          />
        )}
      </main>
    </div>
  );
}

export default Policies;