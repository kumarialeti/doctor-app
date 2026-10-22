import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import { motion } from "framer-motion";
import moment from "moment";
import {
  CalendarDays, Users, CheckCircle2, Clock,
  ArrowRight, Activity, Stethoscope, MessageSquare,
  Video, TrendingUp, IndianRupee, UserCheck, BarChart3,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const DoctorDashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [chartMetric, setChartMetric] = useState("patients"); // "patients" | "revenue"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
        const res = await axios.get(import.meta.env.VITE_API_URL + "/api/doctor/doctor-appointments", config);
        if (res.data.success) setAppointments(res.data.data);
      } catch (err) { console.log(err); }
    };
    fetchData();
  }, []);

  const pending = appointments.filter((a) => a.status === "pending");
  const approved = appointments.filter((a) => a.status === "approved");
  const completed = appointments.filter((a) => a.status === "completed");
  const todayAppts = appointments.filter(
    (a) => moment(a.date).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") && a.status !== "cancelled" && a.status !== "rejected"
  );

  const totalRevenue = completed.reduce((sum, a) => sum + (Number(a.doctorInfo?.fees) || 500), 0);

  // Generate 7-day analytical trend
  const chartData = [6, 5, 4, 3, 2, 1, 0].map((daysAgo) => {
    const dayMoment = moment().subtract(daysAgo, "days");
    const dateStr = dayMoment.format("YYYY-MM-DD");
    const dayLabel = dayMoment.format("ddd, DD");
    
    const dayAppts = appointments.filter(
      (a) => moment(a.date).format("YYYY-MM-DD") === dateStr
    );
    const dayRevenue = dayAppts
      .filter((a) => a.status === "completed" || a.paymentStatus === "paid")
      .reduce((sum, a) => sum + (Number(a.doctorInfo?.fees) || 500), 0);

    return {
      day: dayLabel,
      patients: dayAppts.length,
      revenue: dayRevenue,
    };
  });

  const stats = [
    { label: "Total Patients", value: appointments.length, icon: Users, bg: "bg-violet-50", text: "text-violet-600" },
    { label: "Pending Requests", value: pending.length, icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
    { label: "Completed Visits", value: completed.length, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Estimated Revenue", value: `₹${totalRevenue}`, icon: IndianRupee, bg: "bg-blue-50", text: "text-blue-600" },
  ];

  const quickActions = [
    { label: "Manage Appointments", icon: CalendarDays, color: "bg-violet-600 hover:bg-violet-700", path: "/doctor-appointments" },
    { label: "Messages", icon: MessageSquare, color: "bg-blue-600 hover:bg-blue-700", path: "/chat" },
    { label: "My Profile", icon: Stethoscope, color: "bg-emerald-600 hover:bg-emerald-700", path: `/doctor/profile/${user?._id}` },
  ];

  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } } };

  return (
    <div className="space-y-8">
      {/* Doctor Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl"
      >
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-purple-100 font-semibold text-sm mb-1">Good to see you, Doctor 👨‍⚕️</p>
            <h1 className="text-3xl font-black tracking-tight m-0">Dr. {user?.name || "Doctor"}</h1>
            <p className="text-purple-100 mt-2 text-sm max-w-md">
              You have <strong className="text-white">{pending.length}</strong> pending request{pending.length !== 1 ? "s" : ""} and&nbsp;
              <strong className="text-white">{todayAppts.length}</strong> appointment{todayAppts.length !== 1 ? "s" : ""} today.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
              <Stethoscope size={36} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-purple-100">Doctor Console</span>
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

      {/* Interactive Practice Analytics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-black text-slate-800 m-0 flex items-center gap-2">
              <TrendingUp size={20} className="text-violet-600" />
              Practice Performance & 7-Day Trend
            </h2>
            <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
              Live consultation volume & estimated revenue analytics.
            </p>
          </div>

          {/* Metric Toggle Buttons */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setChartMetric("patients")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border-none cursor-pointer flex items-center gap-1.5 ${
                chartMetric === "patients"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 bg-transparent"
              }`}
            >
              <Users size={13} /> Patient Consultations
            </button>
            <button
              onClick={() => setChartMetric("revenue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border-none cursor-pointer flex items-center gap-1.5 ${
                chartMetric === "revenue"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 bg-transparent"
              }`}
            >
              <IndianRupee size={13} /> Revenue Flow (₹)
            </button>
          </div>
        </div>

        {/* Recharts Area / Bar Chart */}
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === "patients" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1b4b", borderRadius: "12px", border: "none", color: "#fff" }}
                  formatter={(val) => [`${val} Patients`, "Consultations"]}
                />
                <Area type="monotone" dataKey="patients" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#patientGrad)" />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#064e3b", borderRadius: "12px", border: "none", color: "#fff" }}
                  formatter={(val) => [`₹${val}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-slate-800 m-0 flex items-center gap-2">
              <CalendarDays size={20} className="text-violet-500" />
              {todayAppts.length > 0 ? "Today's Schedule" : "Upcoming Appointments"}
            </h2>
            <button
              onClick={() => navigate("/doctor-appointments")}
              className="flex items-center gap-1 text-violet-600 text-xs font-bold bg-violet-50 hover:bg-violet-100 transition px-3 py-1.5 rounded-lg border-none cursor-pointer"
            >
              Manage All <ArrowRight size={14} />
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
              <CalendarDays size={40} className="opacity-30" />
              <p className="font-semibold text-sm">No appointments yet</p>
              <p className="text-xs text-slate-400 text-center max-w-xs">Your appointment requests will appear here once patients book with you.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(todayAppts.length > 0 ? todayAppts : appointments.filter(a => a.status === "pending" || a.status === "approved")).slice(0, 5).map((appt) => (
                <div key={appt._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/40 transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0">
                    {appt.userInfo?.name?.charAt(0) || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm m-0 truncate">{appt.userInfo?.name || "Patient"}</p>
                    <p className="text-xs text-slate-500 font-medium m-0">
                      {moment(appt.date).format("DD MMM")} at {moment(appt.time).format("HH:mm")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      appt.status === "approved" ? "bg-emerald-100 text-emerald-700"
                        : appt.status === "completed" ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {appt.status}
                    </span>
                    {appt.status === "approved" && (
                      <button
                        onClick={() => navigate("/doctor-appointments")}
                        className="bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer hover:bg-violet-700 transition flex items-center gap-1"
                      >
                        <Video size={12} /> Join
                      </button>
                    )}
                    {appt.status === "pending" && (
                      <button
                        onClick={() => navigate("/doctor-appointments")}
                        className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer hover:bg-amber-600 transition"
                      >
                        Review
                      </button>
                    )}
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
              <Activity size={18} className="text-violet-500" /> Quick Actions
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

          {/* Pending Requests Card */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-black text-slate-800 m-0 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" /> Pending Requests
            </h2>
            {pending.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pending.slice(0, 3).map((appt) => (
                  <div key={appt._id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {appt.userInfo?.name?.charAt(0) || "P"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 m-0 truncate">{appt.userInfo?.name || "Patient"}</p>
                      <p className="text-[10px] text-slate-500 m-0">{moment(appt.date).format("DD MMM, HH:mm")}</p>
                    </div>
                  </div>
                ))}
                {pending.length > 3 && (
                  <p className="text-xs text-center text-amber-600 font-semibold">+{pending.length - 3} more</p>
                )}
                <button
                  onClick={() => navigate("/doctor-appointments")}
                  className="w-full text-center text-violet-600 text-xs font-bold py-2 bg-violet-50 hover:bg-violet-100 rounded-xl transition border-none cursor-pointer mt-1"
                >
                  Review All Requests →
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
