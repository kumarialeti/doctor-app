import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Table, message, Modal, Input, Tabs, Calendar as AntCalendar, Badge } from "antd";
import moment from "moment";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { UserContext } from "../components/UserContext";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Video, PhoneOff, Radio, UserCheck, ArrowRight } from "lucide-react";

const { TextArea } = Input;

const DoctorAppointments = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");

  // Telemedicine States
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState("");
  const [callingState, setCallingState] = useState(null); // { patientName, roomId, status: 'calling' | 'declined' }
  const socketRef = useRef(null);

  // Initialize Socket for call signalling
  useEffect(() => {
    if (user?._id) {
      const sock = io(import.meta.env.VITE_API_URL, { query: { userId: user._id } });
      socketRef.current = sock;

      sock.on("call-was-declined", () => {
        setCallingState(prev => prev ? { ...prev, status: "declined" } : null);
        message.warning("Patient declined the video call.");
        setTimeout(() => {
          setCallingState(null);
        }, 2500);
      });

      return () => sock.close();
    }
  }, [user?._id]);

  const getAppointments = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + "/api/doctor/doctor-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const handleStatus = async (record, status) => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/doctor/update-status",
        { appointmentsId: record._id, status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getAppointments();
      }
    } catch (error) {
      console.log(error);
      message.error("Something Went Wrong");
    }
  };

  const handleCompleteConsultation = async () => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/doctor/update-consultation",
        { 
          appointmentsId: selectedAppointment._id, 
          notes, 
          prescription 
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        setIsModalOpen(false);
        setNotes("");
        setPrescription("");
        getAppointments();
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to complete consultation");
    }
  };

  const openCompleteModal = (record) => {
    setSelectedAppointment(record);
    setIsModalOpen(true);
  };

  const startVideoCall = (record) => {
    const roomId = `medicare-consult-${record._id}`;
    setActiveRoomId(roomId);
    
    // Open doctor radar calling overlay
    setCallingState({
      patientName: record.userInfo?.name || "Patient",
      roomId,
      status: "calling"
    });

    // Notify patient via socket
    if (socketRef.current && record.userId) {
      socketRef.current.emit("video-call-invite", {
        toUserId: record.userId,
        fromDoctorName: `Dr. ${user?.name || "Doctor"}`,
        fromDoctorId: user?._id,
        roomId,
      });
    }
  };

  const columns = [
    {
      title: "Patient Info",
      dataIndex: "userInfo",
      render: (text, record) => (
        <div className="flex flex-col">
           <span className="font-semibold text-slate-800">{record.userInfo?.name || 'Unknown'}</span>
           {record.document && (
             <a href={import.meta.env.VITE_API_URL + record.document} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 flex items-center gap-1">
                <i className="fa-solid fa-file-pdf"></i> View Record
             </a>
           )}
        </div>
      )
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      render: (text, record) => (
        <span className="text-slate-600">
          {moment(record.date).format("DD-MM-YYYY")} &nbsp;
          {moment(record.time).format("HH:mm")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${text === 'completed' ? 'bg-green-100 text-green-700' : text === 'cancelled' ? 'bg-slate-100 text-slate-600' : text === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {text}
        </span>
      )
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="flex space-x-2">
          {record.status === "pending" && (
            <div className="flex space-x-2">
              <button
                className="bg-green-50 text-green-600 border border-green-200 px-4 py-1.5 rounded hover:bg-green-100 cursor-pointer transition font-medium"
                onClick={() => handleStatus(record, "approved")}
              >
                Approve
              </button>
              <button
                className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded hover:bg-red-100 cursor-pointer transition font-medium"
                onClick={() => handleStatus(record, "rejected")}
              >
                Reject
              </button>
            </div>
          )}
          {record.status === "approved" && (
            <div className="flex space-x-2">
              <button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer font-semibold border-none flex items-center gap-2"
                onClick={() => startVideoCall(record)}
              >
                <i className="fa-solid fa-video"></i> Join Call
              </button>
              <button
                className="bg-white border border-slate-300 text-slate-700 px-4 py-1.5 rounded shadow-sm hover:bg-slate-50 cursor-pointer transition font-medium flex items-center gap-2"
                onClick={() => openCompleteModal(record)}
              >
                <i className="fa-solid fa-check text-green-500"></i> Mark Completed
              </button>
              <button
                className="bg-indigo-50 border border-indigo-200 text-indigo-600 px-4 py-1.5 rounded shadow-sm hover:bg-indigo-100 cursor-pointer transition font-medium flex items-center gap-2"
                onClick={() => navigate(`/chat?user=${record.userId}&name=${record.userInfo?.name}`)}
              >
                <i className="fa-regular fa-comment-dots"></i> Message
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const activeAppointments = appointments.filter(a => a.status === 'approved');
  const historyAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'rejected');

  const cellRender = (current, info) => {
    if (info.type === 'date') {
      const listData = appointments.filter(app => moment(app.date).format("DD-MM-YYYY") === moment(current.$d || current).format("DD-MM-YYYY"));
      return (
        <ul className="m-0 p-0 list-none text-xs">
          {listData.map((item) => (
            <li key={item._id} className="truncate">
              <Badge 
                status={item.status === 'completed' ? 'success' : item.status === 'rejected' ? 'error' : item.status === 'approved' ? 'processing' : 'warning'} 
                text={`${item.userInfo?.name} (${moment(item.time).format("HH:mm")})`} 
              />
            </li>
          ))}
        </ul>
      );
    }
    return info.originNode;
  };

  return (
    <div className="p-8 h-full bg-white rounded-2xl shadow-sm border border-slate-100 relative">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">Manage Appointments</h1>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: <span className="font-medium text-base">Requests ({pendingAppointments.length})</span>,
            children: (
              <div className="overflow-x-auto mt-2">
                <Table columns={columns} dataSource={pendingAppointments} rowKey="_id" pagination={{ pageSize: 5 }} />
              </div>
            )
          },
          {
            key: "2",
            label: <span className="font-medium text-base">Upcoming Appointments</span>,
            children: (
              <div className="overflow-x-auto mt-2">
                <Table columns={columns} dataSource={activeAppointments} rowKey="_id" pagination={{ pageSize: 5 }} />
              </div>
            )
          },
          {
            key: "3",
            label: <span className="font-medium text-base">History</span>,
            children: (
              <div className="overflow-x-auto mt-2">
                <Table columns={columns} dataSource={historyAppointments} rowKey="_id" pagination={{ pageSize: 5 }} />
              </div>
            )
          },
          {
            key: "4",
            label: <span className="font-medium text-base"><i className="fa-regular fa-calendar"></i> Calendar View</span>,
            children: (
              <div className="mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                 <AntCalendar cellRender={cellRender} className="rounded-lg p-2" />
              </div>
            )
          }
        ]}
      />

      <Modal 
        title={<span className="text-xl font-bold text-slate-800">Complete Consultation</span>} 
        open={isModalOpen} 
        onOk={handleCompleteConsultation} 
        onCancel={() => {
          setIsModalOpen(false);
          setNotes("");
          setPrescription("");
        }}
        okText="Submit Medical Record"
        cancelText="Cancel"
      >
        {selectedAppointment && (
          <div className="mt-4 space-y-4">
            <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm shadow-sm flex flex-col gap-1">
              <span className="font-medium flex items-center gap-2"><i className="fa-solid fa-user text-indigo-500"></i> Patient: {selectedAppointment.userInfo?.name}</span>
              <span className="font-medium flex items-center gap-2"><i className="fa-solid fa-clock text-blue-500"></i> Time: {moment(selectedAppointment.date).format("DD-MM-YYYY")} {moment(selectedAppointment.time).format("HH:mm")}</span>
            </p>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><i className="fa-solid fa-stethoscope text-blue-500"></i> Doctor's Notes (Diagnosis)</label>
              <TextArea
                rows={4}
                className="rounded-xl border-slate-200"
                placeholder="Enter diagnosis and general notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><i className="fa-solid fa-pills text-indigo-500"></i> Prescription</label>
              <TextArea
                rows={4}
                className="rounded-xl border-slate-200"
                placeholder="Enter medicinal prescription details..."
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Telemedicine Video Modal */}
      <Modal
        title={<span className="text-xl font-bold text-slate-800"><i className="fa-solid fa-video text-green-500 mr-2"></i> MediCare Telemedicine Portal</span>}
        open={isVideoCallOpen}
        onCancel={() => setIsVideoCallOpen(false)}
        footer={null}
        width={1000}
        destroyOnClose
        centered
        styles={{ body: { height: '70vh', padding: 0, background: '#1e293b', overflow: 'hidden' } }}
      >
        {isVideoCallOpen && (
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={activeRoomId}
            configOverwrite={{
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableModeratorIndicator: true,
              enableEmailInStats: false
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
            }}
            userInfo={{
              displayName: `Dr. ${user?.name || "Doctor"}`
            }}
            getIFrameRef={(iframeRef) => { iframeRef.style.height = '100%'; }}
          />
        )}
      </Modal>

      {/* Doctor Calling Radar Overlay */}
      <AnimatePresence>
        {callingState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-indigo-100 flex flex-col items-center relative overflow-hidden"
            >
              {/* Sonar Radar Pulses */}
              <div className="relative mb-6">
                {callingState.status === "calling" ? (
                  <>
                    <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xl relative z-10">
                      <Radio size={40} className="animate-spin text-white" />
                    </div>
                  </>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-xl relative z-10">
                    <PhoneOff size={40} />
                  </div>
                )}
              </div>

              <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 ${
                callingState.status === "calling" ? "bg-violet-50 text-violet-700" : "bg-red-50 text-red-700"
              }`}>
                {callingState.status === "calling" ? "Calling Patient..." : "Call Declined"}
              </span>

              <h3 className="text-2xl font-black text-slate-800 m-0 mb-1">{callingState.patientName}</h3>
              <p className="text-xs text-slate-500 font-medium m-0 mb-6">
                {callingState.status === "calling"
                  ? "Ringing patient's screen... Waiting for patient to join consultation."
                  : "Patient declined the video consultation invitation."}
              </p>

              <div className="flex flex-col gap-2.5 w-full">
                {callingState.status === "calling" && (
                  <button
                    onClick={() => {
                      setIsVideoCallOpen(true);
                      setCallingState(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl border-none cursor-pointer text-sm transition shadow-lg shadow-indigo-500/20"
                  >
                    <Video size={18} /> Enter Room Now <ArrowRight size={14} />
                  </button>
                )}

                <button
                  onClick={() => setCallingState(null)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl border-none cursor-pointer text-xs transition"
                >
                  <PhoneOff size={15} /> {callingState.status === "calling" ? "Cancel Call" : "Close"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorAppointments;
