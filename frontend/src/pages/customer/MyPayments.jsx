import { useEffect, useState } from "react";
import api from "../../api/axios";
import CustomerLayout from "../../components/CustomerLayout";

function StatusBadge({ status }) {
  const styles = { paid: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", overdue: "bg-red-100 text-red-700" };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || styles.pending}`}>{status}</span>;
}

function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchPayments = () => api.get("/api/my/payments").then((res) => setPayments(res.data)).finally(() => setLoading(false));

  useEffect(() => { fetchPayments(); }, []);

  const handlePay = (id) => {
    setMessage("");
    api.put(`/api/my/payments/${id}/pay`)
      .then(() => { setMessage("Payment successful!"); fetchPayments(); })
      .catch((err) => setMessage(err.response?.data?.error || "Payment failed."));
  };

  return (
    <CustomerLayout>
      <h2 className="text-xl font-semibold text-slate-800 mb-5">My Payments</h2>
      {message && <p className="text-sm text-slate-600 mb-3">{message}</p>}
      {loading && <p className="text-slate-500 text-sm">Loading...</p>}
      {!loading && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Amount</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Due Date</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600"></th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && <tr><td colSpan="4" className="text-center py-6 text-slate-400">No payment records.</td></tr>}
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-700">₹{p.amount}</td>
                  <td className="px-5 py-3 text-slate-500">{p.due_date}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.payment_status} /></td>
                  <td className="px-5 py-3">
                    {p.payment_status !== "paid" && (
                      <button onClick={() => handlePay(p.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-blue-700">
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CustomerLayout>
  );
}

export default MyPayments;