import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { UserCheck, Check, X } from "lucide-react";

function Approvals() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPending = () => {
    setLoading(true);
    api
      .get("/api/admin/pending-users")
      .then((response) => setPendingUsers(response.data))
      .catch(() => setError("Could not load pending approvals."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleDecision = (userId, decision) => {
    api
      .put(`/api/admin/users/${userId}/decision`, { decision })
      .then(() => fetchPending())
      .catch(() => setError("Could not update user."));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <h2 className="text-xl font-semibold text-slate-800">Pending Approvals</h2>
          <p className="text-sm text-slate-500 mt-0.5">Review new customer registrations</p>
        </header>

        <div className="p-8">
          {loading && <p className="text-slate-500 text-sm">Loading...</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {!loading && !error && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Name</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Email</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Role</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-12">
                        <div className="flex flex-col items-center text-slate-400">
                          <UserCheck size={28} className="mb-2" />
                          <p className="text-sm">No pending approvals</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {pendingUsers.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3 text-slate-800 font-medium">{u.name}</td>
                      <td className="px-5 py-3 text-slate-600">{u.email}</td>
                      <td className="px-5 py-3 text-slate-600 capitalize">{u.role}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleDecision(u.id, "approved")}
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs font-medium">
                            <Check size={14} /> Approve
                          </button>
                          <button onClick={() => handleDecision(u.id, "rejected")}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium">
                            <X size={14} /> Reject
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
      </main>
    </div>
  );
}

export default Approvals;