import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarCheck, ShieldCheck, Video, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse"></div>
      <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-pulse" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-30 animate-pulse" style={{ animationDelay: "4s" }}></div>

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full h-24 px-10 flex items-center justify-between backdrop-blur-md bg-white/40 border-b border-white/50 shadow-sm"
      >
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg text-white">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-gray-800 text-2xl font-black tracking-tight m-0 leading-none">
            MediCare<span className="text-blue-600">Pro</span>
          </h1>
        </div>

        <div className="flex space-x-4">
          <button 
            className="px-6 py-2.5 text-gray-700 font-semibold rounded-full hover:bg-gray-100/50 transition border border-gray-200 backdrop-blur-sm cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
          <button 
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all cursor-pointer border-none"
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto w-full pt-16 pb-20 px-8 lg:px-12 flex flex-col lg:flex-row items-center min-h-[calc(100vh-6rem)] gap-12">
        
        {/* Left Side: Text and CTA */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-1/2 flex flex-col justify-center items-start text-left pt-10 lg:pt-0"
        >
          <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold mb-6 flex items-center gap-2 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
            Accepting New Patients
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-5xl lg:text-[64px] font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Premium care,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              zero friction.
            </span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-lg text-slate-600 mb-10 max-w-lg font-medium leading-relaxed">
            Experience the future of healthcare. Book instant appointments, access digital prescriptions, and connect via HD Telemedicine video calls.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              className="group px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:shadow-slate-500/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer text-base border-none"
              onClick={() => navigate('/login')}
            >
              Book Consultation <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button 
              className="px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer text-base"
              onClick={() => navigate('/apply-doctor')}
            >
              Join as a Doctor
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-14 flex items-center gap-8 text-slate-500 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <CalendarCheck className="text-blue-500" size={20} /> Smart Scheduling
            </div>
            <div className="flex items-center gap-2">
              <Video className="text-indigo-500" size={20} /> HD Telemedicine
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Visuals */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full lg:w-1/2 flex justify-center items-center relative"
        >
          {/* Glass Card Floating Element */}
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-0 lg:-right-10 z-20 backdrop-blur-xl bg-white/60 p-4 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Video size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 m-0">Call Started</p>
              <p className="text-xs text-slate-500 font-medium m-0">Dr. Sarah is waiting...</p>
            </div>
          </motion.div>

          {/* Main Image */}
          <div className="relative w-full max-w-lg aspect-square">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full transform rotate-3 scale-105"></div>
            <img 
              src="/images/landing_doctor.png" 
              alt="Medical Professionals" 
              className="w-full h-full object-cover rounded-[3rem] shadow-2xl relative z-10 border-4 border-white mix-blend-multiply" 
              style={{ objectPosition: 'center top' }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
