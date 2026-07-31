import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import policyInfo from "../data/policyInfo";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { access_token, user } = response.data;
      login(user, access_token);
      navigate(user.role === "customer" ? "/my/dashboard" : "/dashboard");
    } catch (err) {
      const message = err.response?.data?.error || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top brand bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-2">
        <ShieldCheck className="text-blue-600" size={22} />
        <span className="font-semibold text-slate-800">InsureManage</span>
      </div>

      {/* Login form */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">Welcome back</h1>
          <h2 className="text-sm text-center text-gray-500 mb-6">Login to your account</h2>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>

      {/* Policy showcase */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-slate-800">Our Insurance Plans</h3>
          <p className="text-sm text-slate-500 mt-1">Coverage designed around your life</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(policyInfo).map(([type, info]) => {
            const Icon = info.icon;
            return (
              <div key={type} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition">
                <div className={`p-3 rounded-lg ${info.color} w-fit mb-3`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">{type}</h4>
                <p className="text-xs text-slate-500 mb-3">{info.tagline}</p>
                <ul className="space-y-1.5 mb-3">
                  {info.benefits.slice(0, 3).map((b, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                  From ₹{info.startingPremium}/yr
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link to="/plans" className="text-blue-600 text-sm hover:underline">
            View full plan details →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;