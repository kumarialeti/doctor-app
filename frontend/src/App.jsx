import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminAppointments from "./pages/AdminAppointments";
import AdminUsers from "./pages/AdminUsers";
import AdminDoctors from "./pages/AdminDoctors";
import ApplyDoctor from "./pages/ApplyDoctor";
import BookDoctor from "./pages/BookDoctor";
import Appointments from "./pages/Appointments";
import DoctorAppointments from "./pages/DoctorAppointments";
import Notifications from "./pages/Notifications";
import Chat from "./pages/Chat";
import Profile from "./pages/doctor/Profile";
import Settings from "./pages/Settings";
import AiAssistant from "./pages/AiAssistant";
import { UserContext } from "./components/UserContext";
import { useContext } from "react";
import Layout from "./components/Layout";

const DashboardRouteHandler = () => {
  const { user } = useContext(UserContext);
  if (user?.isAdmin) return <Navigate to="/admin" replace />;
  if (user?.isDoctor) return <Navigate to="/doctor-dashboard" replace />;
  return <Layout><Home /></Layout>;
};

function App() {
  const { user } = useContext(UserContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />

        {/* Protected Dashboard Routes Wrapped in Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRouteHandler />
          </ProtectedRoute>
        } />

        <Route path="/patient-dashboard" element={
          <ProtectedRoute>
            <Layout><PatientDashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/doctor-dashboard" element={
          <ProtectedRoute>
            <Layout><DoctorDashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/ai-assistant" element={
          <ProtectedRoute>
            <Layout><AiAssistant /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/apply-doctor" element={
          <ProtectedRoute>
            <Layout><ApplyDoctor /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/doctor/profile/:id" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/book-appointment/:doctorId" element={
          <ProtectedRoute>
            <Layout><BookDoctor /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/appointments" element={
          <ProtectedRoute>
            <Layout><Appointments /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/doctor-appointments" element={
          <ProtectedRoute>
            <Layout><DoctorAppointments /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <Layout><Notifications /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute>
            <Layout><AdminAppointments /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute>
            <Layout><Chat /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute>
            <Layout><AdminUsers /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/admin/doctors" element={
          <ProtectedRoute>
            <Layout><AdminDoctors /></Layout>
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;