import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import { motion } from "framer-motion";
import moment from "moment";
import {
  CalendarDays, Clock, Stethoscope, ArrowRight,
  CheckCircle2, AlertCircle, Search, HeartPulse, Activity,
  Sparkles
} from "lucide-react";

const PatientDashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
        const [apptRes, docRes] = await Promise.all([
          axios.get(import.meta.env.VITE_API_URL + "/api/user/user-appointments", config),
          axios.get(import.meta.env.VITE_API_URL + "/api/user/get-all-approved-doctors", config),
        ]);
        if (apptRes.data.success) setAppointments(apptRes.data.data);
        if (docRes.data.success) setDoctors(docRes.data.data);
      } catch (err) { console.log(err); }
    };
    fetchData();
  }, []);

  const upcoming = appointments.filter((a) => a.status === "pending" || a.status === "approved");
  const completed = appointments.filter((a) => a.status === "completed");
  const cancelled = appointments.filter((a) => a.status === "cancelled" || a.status === "rejected");

  const stats = [
    { label: "Total Appointments", value: appointments.length, icon: CalendarDays, bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Upcoming", value: upcoming.length, icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
    { label: "Completed", value: completed.length, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Cancelled", value: cancelled.length, icon: AlertCircle, bg: "bg-red-50", text: "text-red-500" },
  ];

  const quickActions = [
    { label: "AI Symptom Checker", icon: Sparkles, color: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700", path: "/ai-assistant" },
    { label: "Find a Doctor", icon: Search, color: "bg-indigo-600 hover:bg-indigo-700", path: "/dashboard" },
    { label: "My Appointments", icon: CalendarDays, color: "bg-blue-500 hover:bg-blue-600", path: "/appointments" },
    { label: "Apply as Doctor", icon: Stethoscope, color: "bg-emerald-600 hover:bg-emerald-700", path: "/apply-doctor" },
  ];

  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } } };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white shadow-2xl"
      >
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-blue-100 font-semibold text-sm mb-1">Welcome back 👋</p>
            <h1 className="text-3xl font-black tracking-tight m-0">{user?.name || "Patient"}</h1>
            <p className="text-blue-100 mt-2 text-sm max-w-sm">
              Your health is our priority. You have <strong className="text-white">{upcoming.length}</strong> upcoming appointment{upcoming.length !== 1 ? "s" : ""} scheduled.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
              <HeartPulse size={36} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-blue-100">Health Portal</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <motion.div key={s.label} variants={item} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={22} className={s.text} />
            </div>
            <p className="text-3xl font-black text-slate-800 m-0">{s.value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1 m-0">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-slate-800 m-0 flex items-center gap-2">
              <CalendarDays size={20} className="text-indigo-500" /> Upcoming Appointments
            </h2>
            <button
              onClick={() => navigate("/appointments")}
              className="flex items-center gap-1 text-indigo-600 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 transition px-3 py-1.5 rounded-lg border-none cursor-pointer"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
              <CalendarDays size={40} className="opacity-30" />
              <p className="font-semibold text-sm">No upcoming appointments</p>
              <button onClick={() => navigate("/dashboard")} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-indigo-700 transition">
                Book a Doctor
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((appt) => (
                <div key={appt._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0">
                    {appt.doctorInfo?.fullname?.charAt(0) || "D"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm m-0 truncate">Dr. {appt.doctorInfo?.fullname || "Unknown"}</p>
                    <p className="text-xs text-slate-500 font-medium m-0">{appt.doctorInfo?.specialization || "General"}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-slate-700 m-0">{moment(appt.date).format("DD MMM")}</p>
                    <p className="text-xs text-slate-400 font-medium m-0">{moment(appt.time).format("HH:mm")}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${appt.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-black text-slate-800 m-0 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" /> Quick Actions
            </h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className={`w-full flex items-center gap-3 text-white text-sm font-bold py-3 px-4 rounded-xl ${action.color} transition-all border-none cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5`}
                >
                  <action.icon size={18} /> {action.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Available Doctors */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-black text-slate-800 m-0 mb-4 flex items-center gap-2">
              <Stethoscope size={18} className="text-emerald-500" /> Available Doctors
            </h2>
            <div className="space-y-3">
              {doctors.slice(0, 3).map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition cursor-pointer group"
                  onClick={() => navigate(`/doctor/profile/${doc.userId}`)}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                    {doc.fullname?.charAt(0) || "D"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 m-0 truncate">Dr. {doc.fullname}</p>
                    <p className="text-xs text-slate-500 font-medium m-0 truncate">{doc.specialization}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition flex-shrink-0" />
                </div>
              ))}
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full text-center text-indigo-600 text-xs font-bold py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition border-none cursor-pointer"
              >
                Browse All Doctors →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
