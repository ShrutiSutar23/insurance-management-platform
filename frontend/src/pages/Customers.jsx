import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { Plus, X } from "lucide-react";

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer", phone: "", address: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/api/admin/create-user", form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Could not create user.");
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
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New User</h3>

        {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Full Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input required type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input required type="password" placeholder="Password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="customer">Customer</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
          <input placeholder="Phone (optional)" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

          <button type="submit" disabled={saving}
            className="w-full bg-slate-800 text-white py-2 rounded-md text-sm hover:bg-slate-900 transition disabled:opacity-50">
            {saving ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchCustomers = (searchTerm = "") => {
    setLoading(true);
    api
      .get(`/api/customers?search=${searchTerm}`)
      .then((response) => setCustomers(response.data.data))
      .catch(() => setError("Could not load customers."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Customers</h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage registered customers</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition">
            <Plus size={16} /> New User
          </button>
        </header>

        <div className="p-8">
          <form onSubmit={handleSearch} className="mb-5 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="border border-slate-300 rounded-md px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-900 transition">
              Search
            </button>
          </form>

          {loading && <p className="text-slate-500 text-sm">Loading customers...</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {!loading && !error && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Name</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Email</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Phone</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-6 text-slate-400">No customers found.</td></tr>
                  )}
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3 text-slate-800">{c.name}</td>
                      <td className="px-5 py-3 text-slate-600">{c.email}</td>
                      <td className="px-5 py-3 text-slate-600">{c.phone || "—"}</td>
                      <td className="px-5 py-3 text-slate-600">{c.address || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <CreateUserModal onClose={() => setShowModal(false)} onCreated={() => fetchCustomers(search)} />
        )}
      </main>
    </div>
  );
}

export default Customers;