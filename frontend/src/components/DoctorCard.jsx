import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Phone, Stethoscope, Briefcase, IndianRupee } from "lucide-react";

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
          <Stethoscope size={30} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 m-0">Dr. {doctor.fullname}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
              {doctor.specialization}
            </span>
            <span className="flex items-center text-yellow-500 font-bold text-sm bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
              <i className="fa-solid fa-star text-xs mr-1"></i> {doctor.avgRating || "0.0"} ({doctor.totalReviews || 0})
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 text-sm text-slate-600 mb-6 font-medium">
        <p className="flex items-center gap-2 m-0 bg-slate-50 p-2 rounded-lg">
          <Phone size={16} className="text-slate-400" />
          <span className="text-slate-700">{doctor.phone}</span>
        </p>
        <p className="flex items-center gap-2 m-0 bg-slate-50 p-2 rounded-lg truncate">
          <MapPin size={16} className="text-slate-400" />
          <span className="text-slate-700 truncate">{doctor.address}</span>
        </p>
        <div className="flex gap-2">
          <p className="flex-1 flex items-center gap-2 m-0 bg-slate-50 p-2 rounded-lg justify-between">
            <Briefcase size={16} className="text-slate-400" />
            <span className="text-slate-700 italic">{doctor.experience} Yrs</span>
          </p>
          <p className="flex-1 flex items-center gap-1 m-0 bg-slate-50 p-2 rounded-lg justify-between shadow-inner bg-green-50/50">
            <span className="font-bold text-green-600 flex items-center"><IndianRupee size={14}/> {doctor.fees}</span>
          </p>
        </div>
        <p className="flex items-center justify-center gap-2 m-0 bg-blue-50 text-blue-700 p-2 rounded-lg border border-blue-100 mt-2">
          <Clock size={16} />
          <span>{doctor.timings?.[0]} - {doctor.timings?.[1]}</span>
        </p>
      </div>

      <button 
        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md border-none flex items-center justify-center gap-2 cursor-pointer"
        onClick={() => navigate(`/book-appointment/${doctor._id}`)}
      >
        <Calendar size={18} />
        Book Appointment
      </button>
    </div>
  );
};

export default DoctorCard;