import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import DoctorCard from "../components/DoctorCard";
import { UserContext } from "../components/UserContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const { user } = useContext(UserContext);

  const getUserData = async () => {
    try {
      const res = await axios.get(
        import.meta.env.VITE_API_URL + "/api/user/get-all-approved-doctors",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  if (user?.isAdmin) {
    return <Navigate to="/admin" />;
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="h-full w-full">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-slate-800 m-0 tracking-tight">Find your Doctor</h1>
        <p className="text-slate-500 font-medium m-0 mt-1">Book an appointment with top specialists.</p>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {doctors && doctors.map((doctor) => (
          <motion.div variants={itemVariants} key={doctor._id}>
            <DoctorCard doctor={doctor} />
          </motion.div>
        ))}
      </motion.div>

      {doctors && doctors.length === 0 && (
        <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400">
           <i className="fa-solid fa-user-doctor text-4xl mb-4 opacity-50"></i>
           <p className="font-medium">No doctors are currently available.</p>
        </div>
      )}
    </div>
  );
};

export default Home;