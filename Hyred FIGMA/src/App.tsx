import { HashRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SelectRole from "./pages/SelectRole";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

// Employer Pages
import EmployerDashboard from "./pages/employer/Dashboard";
import EmployerProfile from "./pages/employer/Profile";
import EmployerDiscover from "./pages/employer/Discover";

// VA Pages
import VADashboard from "./pages/va/Dashboard";
import VAProfile from "./pages/va/Profile";

// Shared Pages
import Chat from "./pages/Chat";
import Contract from "./pages/Contract";

// Admin
import Admin from "./pages/admin/Admin";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/select-role" element={<SelectRole />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Employer Routes */}
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/employer/profile" element={<EmployerProfile />} />
        <Route path="/employer/discover" element={<EmployerDiscover />} />

        {/* VA Routes */}
        <Route path="/va/dashboard" element={<VADashboard />} />
        <Route path="/va/profile" element={<VAProfile />} />

        {/* Shared Routes */}
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/contracts/:id" element={<Contract />} />
        <Route path="/messages" element={<Chat />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
