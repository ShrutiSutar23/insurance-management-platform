import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { Inbox, X } from "lucide-react";

function CreatePolicyFromRequestModal({ req, onClose, onDone }) {
  const [form, setForm] = useState({
    policy_number: "", premium_amount: "", start_date: "", end_date: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await api.post("/api/policies", {
        customer_id: req.customer_id,
        policy_type: req.policy_type,
        policy_number: form.policy_number,
        premium_amount: parseFloat(form.premium_amount),
        start_date: form.start_date,
        end_date: form.end_date,
        fulfilled_request_id: req.id,
      });
      onDone(); onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Could not create policy.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Create Policy for {req.customer_name}</h3>
        <p className="text-xs text-slate-500 mb-4">
          Requested: {req.policy_type}{req.desired_coverage ? ` — ₹${req.desired_coverage} desired` : ""}
        </p>
        {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Policy Number (e.g. POL-2026-010)" value={form.policy_number}
            onChange={(e) => setForm({ ...form, policy_number: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          <input required type="number" min="1" step="0.01" placeholder="Premium Amount (₹)" value={form.premium_amount}
            onChange={(e) => setForm({ ...form, premium_amount: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="date" value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <input required type="date" value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-slate-800 text-white py-2 rounded-md text-sm hover:bg-slate-900 disabled:opacity-50">
            {saving ? "Creating..." : "Create Policy & Approve Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

function RenewPolicyFromRequestModal({ req, onClose, onDone }) {
  const [newEndDate, setNewEndDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await api.put(`/api/policies/${req.policy_id}/renew`, {
        new_end_date: newEndDate,
        fulfilled_request_id: req.id,
      });
      onDone(); onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Could not renew policy.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Renew Policy {req.existing_policy_number}</h3>
        <p className="text-xs text-slate-500 mb-4">Requested by {req.customer_name}</p>
        {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs text-slate-500 mb-1">New End Date</label>
          <input required type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          <button type="submit" disabled={saving} className="w-full bg-slate-800 text-white py-2 rounded-md text-sm hover:bg-slate-900 disabled:opacity-50">
            {saving ? "Renewing..." : "Renew & Approve Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PolicyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeModal, setActiveModal] = useState(null); // { type: "new"|"renewal", req }

  const fetchRequests = () => {
    setLoading(true);
    api.get("/api/policy-requests?status=pending")
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleReject = (id) => {
    api.put(`/api/policy-requests/${id}/reject`)
      .then(() => { setMessage("Request rejected."); fetchRequests(); })
      .catch(() => setMessage("Could not reject request."));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <h2 className="text-xl font-semibold text-slate-800">Policy Requests</h2>
          <p className="text-sm text-slate-500 mt-0.5">New policy and renewal requests from customers</p>
        </header>

        <div className="p-8">
          {message && <p className="text-sm text-slate-600 mb-3">{message}</p>}
          {loading && <p className="text-slate-500 text-sm">Loading...</p>}

          {!loading && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Customer</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Type</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Details</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Notes</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-12">
                      <div className="flex flex-col items-center text-slate-400">
                        <Inbox size={28} className="mb-2" /><p className="text-sm">No pending requests</p>
                      </div>
                    </td></tr>
                  )}
                  {requests.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3 text-slate-800 font-medium">{r.customer_name}</td>
                      <td className="px-5 py-3 text-slate-600 capitalize">{r.request_type}</td>
                      <td className="px-5 py-3 text-slate-600">
                        {r.request_type === "new"
                          ? `${r.policy_type}${r.desired_coverage ? ` — ₹${r.desired_coverage}` : ""}`
                          : `Policy ${r.existing_policy_number}`}
                      </td>
                      <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{r.notes || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => setActiveModal({ type: r.request_type, req: r })}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            {r.request_type === "new" ? "Create Policy" : "Renew"}
                          </button>
                          <button onClick={() => handleReject(r.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {activeModal?.type === "new" && (
          <CreatePolicyFromRequestModal req={activeModal.req} onClose={() => setActiveModal(null)} onDone={fetchRequests} />
        )}
        {activeModal?.type === "renewal" && (
          <RenewPolicyFromRequestModal req={activeModal.req} onClose={() => setActiveModal(null)} onDone={fetchRequests} />
        )}
      </main>
    </div>
  );
}

export default PolicyRequests;