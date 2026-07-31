import { useEffect, useState } from "react";
import api from "../../api/axios";
import CustomerLayout from "../../components/CustomerLayout";
import { Plus, X } from "lucide-react";

function StatusBadge({ status }) {
  const styles = { active: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-700", expired: "bg-slate-200 text-slate-600" };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>;
}

function RequestPolicyModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ policy_type: "", desired_coverage: "", notes: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await api.post("/api/my/policy-requests", form);
      onCreated(); onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit request.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Request a New Policy</h3>
        <p className="text-xs text-slate-500 mb-4">An agent will review your request and set up the final policy terms.</p>
        {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <select required value={form.policy_type} onChange={(e) => setForm({ ...form, policy_type: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
            <option value="">-- Select policy type --</option>
            <option value="Health Insurance">Health Insurance</option>
            <option value="Life Insurance">Life Insurance</option>
            <option value="Vehicle Insurance">Vehicle Insurance</option>
            <option value="Home Insurance">Home Insurance</option>
          </select>
          <input type="number" placeholder="Desired coverage amount (₹) - optional" value={form.desired_coverage}
            onChange={(e) => setForm({ ...form, desired_coverage: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          <textarea rows={2} placeholder="Additional notes (optional)" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MyPolicies() {
  const [policies, setPolicies] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAll = () => {
    api.get("/api/my/policies").then((res) => setPolicies(res.data));
    api.get("/api/my/policy-requests").then((res) => setRequests(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRenewalRequest = (policyId) => {
    setMessage("");
    api.post(`/api/my/policies/${policyId}/renewal-request`, {})
      .then(() => { setMessage("Renewal request submitted."); fetchAll(); })
      .catch((err) => setMessage(err.response?.data?.error || "Could not submit renewal request."));
  };

  const pendingRenewalPolicyIds = requests
    .filter((r) => r.request_type === "renewal" && r.status === "pending")
    .map((r) => r.policy_id);

  return (
    <CustomerLayout>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-slate-800">My Policies</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          <Plus size={16} /> Request New Policy
        </button>
      </div>

      {message && <p className="text-sm text-slate-600 mb-3">{message}</p>}
      {loading && <p className="text-slate-500 text-sm">Loading...</p>}

      {!loading && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Policy No.</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Type</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Premium</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">End Date</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600"></th>
              </tr>
            </thead>
            <tbody>
              {policies.length === 0 && <tr><td colSpan="6" className="text-center py-6 text-slate-400">No policies found.</td></tr>}
              {policies.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{p.policy_number}</td>
                  <td className="px-5 py-3 text-slate-600">{p.policy_type}</td>
                  <td className="px-5 py-3 text-slate-600">₹{p.premium_amount}</td>
                  <td className="px-5 py-3 text-slate-600">{p.end_date}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3">
                    {p.status !== "cancelled" && !pendingRenewalPolicyIds.includes(p.id) && (
                      <button onClick={() => handleRenewalRequest(p.id)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                        Request Renewal
                      </button>
                    )}
                    {pendingRenewalPolicyIds.includes(p.id) && (
                      <span className="text-xs text-amber-600">Renewal pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="text-sm font-semibold text-slate-700 mb-3">My Requests</h3>
      {!loading && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Type</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Details</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && <tr><td colSpan="3" className="text-center py-6 text-slate-400">No requests yet.</td></tr>}
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-700 capitalize">{r.request_type}</td>
                  <td className="px-5 py-3 text-slate-600">{r.policy_type || `Policy #${r.policy_id}`}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      r.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                      r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <RequestPolicyModal onClose={() => setShowModal(false)} onCreated={fetchAll} />}
    </CustomerLayout>
  );
}

export default MyPolicies;