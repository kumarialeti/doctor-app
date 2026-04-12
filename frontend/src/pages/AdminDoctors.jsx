import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, message } from "antd";
import { motion } from "framer-motion";
import { UserPlus, UserCheck, Phone, Check, X, Stethoscope } from "lucide-react";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      };
      const resDocs = await axios.get(import.meta.env.VITE_API_URL + "/api/admin/get-all-doctors", config);
      if (resDocs.data.success) setDoctors(resDocs.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccountStatus = async (record, status) => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/admin/change-account-status",
        { doctorId: record._id, status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data.success) {
        message.success(res.data.message);
        fetchData();
      }
    } catch (error) {
      console.log(error);
      message.error("Something went wrong");
    }
  };

  const doctorColumns = [
    { 
      title: <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Doctor Name</span>, 
      dataIndex: "fullname",
      render: (text) => <span className="font-bold text-slate-800 tracking-tight">Dr. {text}</span>
    },
    { 
      title: <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Status</span>, 
      dataIndex: "status",
      render: (text) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize border ${text === "approved" ? "bg-green-100 text-green-700 border-green-200" : text === "rejected" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
          {text === "approved" ? <UserCheck size={14} /> : text === "pending" ? <UserPlus size={14} /> : <X size={14} />} {text}
        </span>
      )
    },
    { 
      title: <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Contact</span>, 
      dataIndex: "phone",
      render: (text) => <span className="flex items-center gap-2 text-slate-600 font-medium"><Phone size={14} className="text-slate-400"/> {text}</span>
    },
    {
      title: <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Actions</span>,
      dataIndex: "actions",
      render: (text, record) => (
        <div className="flex space-x-2">
          {record.status === "pending" && (
             <div className="flex gap-2">
                <button 
                  className="bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-500 hover:text-white cursor-pointer transition-all font-bold flex items-center gap-1" 
                  onClick={() => handleAccountStatus(record, "approved")}
                >
                  <Check size={16} /> Approve
                </button>
                <button 
                  className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white cursor-pointer transition-all font-bold flex items-center gap-1" 
                  onClick={() => handleAccountStatus(record, "rejected")}
                >
                   <X size={16} /> Reject
                </button>
              </div>
          )}
          {record.status === "approved" && (
            <button 
              className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white cursor-pointer transition-all font-bold flex items-center gap-1" 
              onClick={() => handleAccountStatus(record, "rejected")}
            >
                <X size={16} /> Revoke Access
            </button>
          )}
          {record.status === "rejected" && (
            <button 
              className="bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-500 hover:text-white cursor-pointer transition-all font-bold flex items-center gap-1" 
              onClick={() => handleAccountStatus(record, "approved")}
            >
                <Check size={16} /> Re-Approve
            </button>
          )}
        </div>
      ),
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
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xl shadow-sm border border-blue-100">
          <Stethoscope size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 m-0 tracking-tight">Doctor Applications</h1>
          <p className="text-slate-500 font-medium m-0 text-sm">Review, approve, or reject incoming provider accounts.</p>
        </div>
      </div>
      
      <div className="bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
        <Table 
          columns={doctorColumns} 
          dataSource={doctors} 
          rowKey="_id" 
          pagination={{ pageSize: 8 }} 
          size="middle" 
          className="shadow-sm rounded-xl overflow-hidden bg-white"
        />
      </div>
    </motion.div>
  );
};

export default AdminDoctors;
