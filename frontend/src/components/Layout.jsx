import React, { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Bell, Settings, Video, PhoneOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";
import { Modal, message } from "antd";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { playRingtone, stopRingtone } from "../utils/ringtone";

const Layout = ({ children }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Global Video Call State
  const [incomingCall, setIncomingCall] = useState(null); // { fromDoctorName, fromDoctorId, roomId }
  const [isGlobalVideoOpen, setIsGlobalVideoOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    if (user?._id) {
      const sock = io(import.meta.env.VITE_API_URL, { query: { userId: user._id } });
      socketRef.current = sock;

      sock.on("incoming-video-call", ({ fromDoctorName, fromDoctorId, roomId }) => {
        setIncomingCall({ fromDoctorName, fromDoctorId, roomId });
        playRingtone();
      });

      return () => {
        stopRingtone();
        sock.close();
      };
    }
  }, [user?._id]);

  const handleJoinCall = () => {
    stopRingtone();
    if (incomingCall?.roomId) {
      setActiveRoomId(incomingCall.roomId);
      setIsGlobalVideoOpen(true);
      setIncomingCall(null);
    }
  };

  const handleDeclineCall = () => {
    stopRingtone();
    if (socketRef.current && incomingCall?.fromDoctorId) {
      socketRef.current.emit("video-call-declined", { toDoctorId: incomingCall.fromDoctorId });
    }
    setIncomingCall(null);
    message.info("You declined the video call.");
  };

  const handleLogout = () => {
    stopRingtone();
    localStorage.clear();
    window.location.reload();
  };

  const userMenu = [
    { name: "Dashboard", path: "/patient-dashboard", icon: "fa-solid fa-house-medical" },
    { name: "Find Doctors", path: "/dashboard", icon: "fa-solid fa-user-doctor" },
    { name: "AI Health Assistant", path: "/ai-assistant", icon: "fa-solid fa-wand-magic-sparkles" },
    { name: t("Appointments"), path: "/appointments", icon: "fa-regular fa-calendar-check" },
    { name: t("Messages"), path: "/chat", icon: "fa-regular fa-comment-dots" },
    { name: t("Apply doctor"), path: "/apply-doctor", icon: "fa-solid fa-notes-medical" },
    { name: t("Settings"), path: "/settings", icon: "fa-solid fa-gear" },
  ];

  const adminMenu = [
    { name: t("Appointments"), path: "/admin", icon: "fa-regular fa-calendar-check" },
    { name: t("Messages"), path: "/chat", icon: "fa-regular fa-comment-dots" },
    { name: t("Users"), path: "/admin/users", icon: "fa-solid fa-users" },
    { name: t("Doctors"), path: "/admin/doctors", icon: "fa-solid fa-user-doctor" },
    { name: t("Settings"), path: "/settings", icon: "fa-solid fa-gear" },
  ];

  const doctorMenu = [
    { name: "Dashboard", path: "/doctor-dashboard", icon: "fa-solid fa-gauge-high" },
    { name: t("Appointments"), path: "/doctor-appointments", icon: "fa-regular fa-calendar-check" },
    { name: t("Messages"), path: "/chat", icon: "fa-regular fa-comment-dots" },
    { name: t("Profile"), path: `/doctor/profile/${user?._id}`, icon: "fa-solid fa-user" },
    { name: t("Settings"), path: "/settings", icon: "fa-solid fa-gear" },
  ];

  const menuToBeRendered = user?.isAdmin
    ? adminMenu
    : user?.isDoctor
    ? doctorMenu
    : userMenu;

  return (
    <div className="flex h-screen bg-slate-50 p-4 font-sans relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] right-[10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-1 overflow-hidden bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl relative z-10"
      >
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col pt-8 pb-10 shadow-2xl z-20">
          <motion.div 
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             onClick={() => navigate(user?.isAdmin ? "/admin" : user?.isDoctor ? "/doctor-dashboard" : "/patient-dashboard")}
             className="px-8 mb-12 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <h1 className="text-xl font-black tracking-tight text-white m-0">
              {user?.isAdmin ? t("AdminConsole") : t("MediCarePro")}
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {user?.isAdmin ? t("System Management") : user?.isDoctor ? "Doctor Console" : t("Patient Dashboard")}
            </p>
          </motion.div>
          
          <div className="flex-1 overflow-y-auto w-full px-4">
            <div className="space-y-1 text-sm font-semibold">
              {menuToBeRendered.map((menu, idx) => (
                <motion.div
                  key={menu.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * idx + 0.3 }}
                  onClick={() => navigate(menu.path)}
                  className="flex items-center text-slate-400 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl cursor-pointer transition-all group"
                >
                  <i className={`${menu.icon} w-6 text-lg group-hover:scale-110 transition-transform`}></i>
                  <span>{menu.name}</span>
                </motion.div>
              ))}
              <motion.div
                 initial={{ x: -20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ delay: 0.6 }}
              >
                  <div className="h-px bg-slate-800 my-6 mx-4"></div>
                  <div
                    onClick={handleLogout}
                    className="flex items-center text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-3 rounded-xl cursor-pointer transition-all group"
                  >
                    <LogOut className="w-6 mr-1 group-hover:scale-110 transition-transform" size={18} />
                    <span>{t("Logout")}</span>
                  </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="h-20 bg-white/50 backdrop-blur-md flex items-center justify-between px-8 mx-6 mt-6 rounded-2xl shadow-sm border border-white/60"
          >
            <div>
               <h2 className="text-lg font-bold text-slate-800 m-0 capitalize">{t("Welcome back")}, {user?.name || "User"}</h2>
               <p className="text-xs text-slate-500 font-medium m-0">{t("Here's what's happening with your appointments today.")}</p>
            </div>
            <div 
               className="flex items-center gap-3 text-slate-700 font-bold text-sm cursor-pointer hover:bg-slate-100 py-2 px-4 rounded-xl transition" 
               onClick={() => navigate("/notifications")}
            >
              <div className="relative">
                <Bell size={20} className="text-indigo-600" />
                {user?.notification?.length > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <span>{t("Notifications")}</span>
            </div>
          </motion.div>

          {/* Body Content */}
          <div className="flex-1 overflow-auto p-6 scroll-smooth">
            <motion.div
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="h-full"
            >
               {children}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Global Incoming Video Call Overlay */}
      <AnimatePresence>
        {incomingCall && (
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
              {/* Pulsing Sonar Ring Visual */}
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl relative z-10">
                  <Video size={42} className="animate-pulse" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white block animate-pulse" />
              </div>

              <span className="bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                Incoming Consultation Call
              </span>
              <h3 className="text-2xl font-black text-slate-800 m-0 mb-1">{incomingCall.fromDoctorName}</h3>
              <p className="text-xs text-slate-500 font-medium m-0 mb-6">
                is calling you for your telemedicine consultation...
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleDeclineCall}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-2xl border-none cursor-pointer text-sm transition"
                >
                  <PhoneOff size={18} /> Decline
                </button>
                <button
                  onClick={handleJoinCall}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3.5 rounded-2xl border-none cursor-pointer text-sm transition shadow-lg shadow-emerald-500/25"
                >
                  <Video size={18} /> Join Call
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Telemedicine Video Call Modal */}
      <Modal
        title={<span className="text-xl font-bold text-slate-800"><i className="fa-solid fa-video text-green-500 mr-2"></i> MediCare Telemedicine Portal</span>}
        open={isGlobalVideoOpen}
        onCancel={() => setIsGlobalVideoOpen(false)}
        footer={null}
        width={1000}
        destroyOnClose
        centered
        styles={{ body: { height: '70vh', padding: 0, background: '#1e293b', overflow: 'hidden' } }}
      >
        {isGlobalVideoOpen && (
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
              displayName: user?.name || "Patient"
            }}
            getIFrameRef={(iframeRef) => { iframeRef.style.height = '100%'; }}
          />
        )}
      </Modal>
    </div>
  );
};

export default Layout;
