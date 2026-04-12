import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, message, Tabs } from "antd";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      };
      const [resUsers, resDocs, resApps] = await Promise.all([
        axios.get(import.meta.env.VITE_API_URL + "/api/admin/get-all-users", config),
        axios.get(import.meta.env.VITE_API_URL + "/api/admin/get-all-doctors", config),
        axios.get(import.meta.env.VITE_API_URL + "/api/admin/get-all-appointments", config)
      ]);
      
      if (resUsers.data.success) setUsers(resUsers.data.data);
      if (resDocs.data.success) setDoctors(resDocs.data.data);
      if (resApps.data.success) setAppointments(resApps.data.data);
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

  const apptColumns = [
    { title: <span className="font-bold text-xs uppercase text-gray-500">Appointment ID</span>, dataIndex: "_id" },
    { title: <span className="font-bold text-xs uppercase text-gray-500">User Name</span>, dataIndex: "userInfo", render: (text, record) => <span>{record?.userInfo?.name || "User"}</span> },
    { title: <span className="font-bold text-xs uppercase text-gray-500">Doctor Name</span>, dataIndex: "doctorInfo", render: (text, record) => <span>{record?.doctorInfo?.fullname?.replace('Dr.', '') || "Doctor"}</span> },
    { title: <span className="font-bold text-xs uppercase text-gray-500">Date</span>, dataIndex: "date", render: (text, record) => <span>{new Date(record.date).toISOString().split('T')[0]} {new Date(record.time).toISOString().substring(11,16)}</span> },
    { title: <span className="font-bold text-xs uppercase text-gray-500">Status</span>, dataIndex: "status", render: (text, record) => <span>{record.status}</span> },
  ];

  const doctorColumns = [
    { title: "Name", dataIndex: "fullname" },
    { title: "Status", dataIndex: "status" },
    { title: "phone", dataIndex: "phone" },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="flex space-x-2">
          {record.status === "pending" ? (
            <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 cursor-pointer" onClick={() => handleAccountStatus(record, "approved")}>Approve</button>
          ) : (
            <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer" onClick={() => handleAccountStatus(record, "rejected")}>Reject</button>
          )}
        </div>
      ),
    },
  ];

  const userColumns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Doctor", dataIndex: "isDoctor", render: (text, record) => <span>{record.isDoctor ? "Yes" : "No"}</span> },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-sm border border-gray-200 p-2">
      <Tabs
        defaultActiveKey="1"
        className="w-full"
        items={[
          {
            key: "1",
            label: "Appointments",
            children: (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800 text-center py-2">All Appointments for Admin Panel</h2>
                <Table columns={apptColumns} dataSource={appointments} rowKey="_id" pagination={{ pageSize: 8 }} size="middle" className="overflow-x-auto" />
              </div>
            )
          },
          {
            key: "2",
            label: "Doctors",
            children: <Table columns={doctorColumns} dataSource={doctors} rowKey="_id" pagination={{ pageSize: 5 }} />
          },
          {
            key: "3",
            label: "Users",
            children: <Table columns={userColumns} dataSource={users} rowKey="_id" pagination={{ pageSize: 5 }} />
          }
        ]}
      />
    </div>
  );
};

export default Admin;