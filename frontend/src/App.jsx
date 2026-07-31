import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Policies from "./pages/Policies";
import Claims from "./pages/Claims";
import Payments from "./pages/Payments";
import Documents from "./pages/Documents";
import Approvals from "./pages/Approvals";
import MyDashboard from "./pages/customer/MyDashboard";
import MyPolicies from "./pages/customer/MyPolicies";
import MyClaims from "./pages/customer/MyClaims";
import MyPayments from "./pages/customer/MyPayments";
import MyDocuments from "./pages/customer/MyDocuments";
import PolicyRequests from "./pages/PolicyRequests";
import Plans from "./pages/Plans";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return user.role === "customer" ? <Navigate to="/my/dashboard" /> : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/plans" element={<Plans />} />

          {/* Staff (admin/agent) routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
          <Route path="/claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/policy-requests" element={<ProtectedRoute><PolicyRequests /></ProtectedRoute>} />

          {/* Customer self-service routes */}
          <Route path="/my/dashboard" element={<ProtectedRoute><MyDashboard /></ProtectedRoute>} />
          <Route path="/my/policies" element={<ProtectedRoute><MyPolicies /></ProtectedRoute>} />
          <Route path="/my/claims" element={<ProtectedRoute><MyClaims /></ProtectedRoute>} />
          <Route path="/my/payments" element={<ProtectedRoute><MyPayments /></ProtectedRoute>} />
          <Route path="/my/documents" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />

          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;