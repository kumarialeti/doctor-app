import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "antd";
import { motion } from "framer-motion";
import { Users, CheckCircle, XCircle } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      };
      const resUsers = await axios.get(import.meta.env.VITE_API_URL + "/api/admin/get-all-users", config);
      if (resUsers.data.success) setUsers(resUsers.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const userColumns = [
    { 
      title: <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Name</span>, 
      dataIndex: "name",
      render: (text) => <span className="font-bold text-slate-800">{text}</span>
    },
    { 
      title: <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Email</span>, 
      dataIndex: "email",
      render: (text) => <span className="text-slate-600 font-medium">{text}</span>
    },
    { 
      title: <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Role</span>, 
      dataIndex: "isDoctor", 
      render: (text, record) => (
        record.isAdmin ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
             Admin
          </span>
        ) : record.isDoctor ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <CheckCircle size={14} /> Doctor
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
             Patient
          </span>
        )
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
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-xl shadow-sm border border-indigo-100">
          <Users size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 m-0 tracking-tight">System Users</h1>
          <p className="text-slate-500 font-medium m-0 text-sm">Manage all registered accounts across the platform.</p>
        </div>
      </div>
      
      <div className="bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
        <Table 
          columns={userColumns} 
          dataSource={users} 
          rowKey="_id" 
          pagination={{ pageSize: 8 }} 
          size="middle" 
          className="shadow-sm rounded-xl overflow-hidden bg-white"
        />
      </div>
    </motion.div>
  );
};

export default AdminUsers;
