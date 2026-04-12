import React, { useContext } from "react";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Bell, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

const Layout = ({ children }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const userMenu = [
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
             className="px-8 mb-12"
          >
            <h1 className="text-xl font-black tracking-tight text-white m-0">
              {user?.isAdmin ? t("AdminConsole") : t("MediCarePro")}
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {user?.isAdmin ? t("System Management") : t("Patient Dashboard")}
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
    </div>
  );
};

export default Layout;
