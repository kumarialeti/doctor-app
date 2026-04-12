import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "antd";
import moment from "moment";
import { motion } from "framer-motion";
import { CalendarDays, LayoutList, Clock, Users, UserRoundCog } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalDoctors: 0, totalAppointments: 0, chartData: [] });

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      };
      
      const resApps = await axios.get(import.meta.env.VITE_API_URL + "/api/admin/get-all-appointments", config);
      if (resApps.data.success) setAppointments(resApps.data.data);

      const resAn = await axios.get(import.meta.env.VITE_API_URL + "/api/admin/analytics", config);
      if (resAn.data.success) setAnalytics(resAn.data.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const apptColumns = [
    { 
      title: <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Appointment ID</span>, 
      dataIndex: "_id",
      render: (text) => <span className="text-slate-400 font-mono text-xs">{text}</span>
    },
    { 
      title: <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Patient</span>, 
      dataIndex: "userInfo", 
      render: (text, record) => <span className="font-bold text-slate-800">{record?.userInfo?.name || "User"}</span> 
    },
    { 
      title: <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Doctor</span>, 
      dataIndex: "doctorInfo", 
      render: (text, record) => <span className="font-bold text-indigo-700">Dr. {record?.doctorInfo?.fullname?.replace('Dr.', '') || "Doctor"}</span> 
    },
    { 
      title: <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Schedule</span>, 
      dataIndex: "date", 
      render: (text, record) => (
        <span className="flex items-center gap-3 text-slate-600 font-medium whitespace-nowrap">
          <span className="flex items-center gap-1"><CalendarDays size={14} className="text-blue-500"/> {record.date && moment(record.date).isValid() ? moment(record.date).format("DD-MM-YYYY") : "Invalid Date"}</span>
          <span className="flex items-center gap-1"><Clock size={14} className="text-purple-500"/> {record.time && moment(record.time).isValid() ? moment(record.time).format("HH:mm") : "Invalid Time"}</span>
        </span>
      ) 
    },
    { 
      title: <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Status</span>, 
      dataIndex: "status", 
      render: (text, record) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold capitalize border ${text === "completed" ? "bg-green-100 text-green-700 border-green-200" : text === "approved" ? "bg-blue-100 text-blue-700 border-blue-200" : text === "cancelled" || text === "rejected" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
          {text}
        </span>
      ) 
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 h-full bg-white rounded-2xl shadow-sm border border-slate-100 relative"
    >
      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 text-xl shadow-sm border border-purple-100">
          <LayoutList size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 m-0 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium m-0 text-sm">Monitor platform metrics, bookings, and statuses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-indigo-600 text-white p-4 rounded-xl"><Users size={24} /></div>
          <div><p className="text-sm font-bold text-slate-500 m-0 uppercase tracking-widest">Total Users</p><h2 className="text-3xl font-black m-0 text-indigo-700">{analytics.totalUsers}</h2></div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-emerald-600 text-white p-4 rounded-xl"><UserRoundCog size={24} /></div>
          <div><p className="text-sm font-bold text-slate-500 m-0 uppercase tracking-widest">Total Doctors</p><h2 className="text-3xl font-black m-0 text-emerald-700">{analytics.totalDoctors}</h2></div>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-amber-600 text-white p-4 rounded-xl"><CalendarDays size={24} /></div>
          <div><p className="text-sm font-bold text-slate-500 m-0 uppercase tracking-widest">Appointments</p><h2 className="text-3xl font-black m-0 text-amber-700">{analytics.totalAppointments}</h2></div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-8 shadow-sm">
        <h4 className="font-bold text-slate-700 mb-6">Appointments Over Time</h4>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="appointments" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <h4 className="font-bold text-slate-700 mb-4 px-2">Recent Bookings</h4>
      
      <div className="bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
        <Table 
          columns={apptColumns} 
          dataSource={appointments} 
          rowKey="_id" 
          pagination={{ pageSize: 8 }} 
          size="middle" 
          className="shadow-sm rounded-xl overflow-hidden bg-white"
        />
      </div>
    </motion.div>
  );
};

export default AdminAppointments;
