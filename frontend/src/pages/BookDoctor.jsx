import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DatePicker, message, TimePicker } from "antd";
import moment from "moment";
import { UserContext } from "../components/UserContext";

const BookDoctor = () => {
  const { user } = useContext(UserContext);
  const params = useParams();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState();
  const [time, setTime] = useState();
  const [isAvailable, setIsAvailable] = useState(false);
  const [document, setDocument] = useState(null);
  const navigate = useNavigate();

  const getDoctorData = async () => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/doctor/get-doctor-by-id",
        { doctorId: params.doctorId },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setDoctor(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAvailability = async () => {
    try {
      if (!date || !time) return message.error("Date & Time required");
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/user/check-availability",
        { doctorId: params.doctorId, date, time },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setIsAvailable(true);
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      message.error("Error checking availability");
    }
  };

  const handleBooking = async () => {
    try {
      if (!date || !time) return message.error("Date & Time Required");
      
      const formData = new FormData();
      formData.append("doctorId", params.doctorId);
      formData.append("userId", user?._id);
      formData.append("doctorInfo", JSON.stringify(doctor));
      formData.append("userInfo", JSON.stringify(user));
      formData.append("date", date);
      formData.append("time", time);
      if (document) {
        formData.append("document", document);
      }

      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/user/book-appointment",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        navigate("/appointments");
      }
    } catch (error) {
      console.log(error);
      message.error("Error booking appointment");
    }
  };

  useEffect(() => {
    getDoctorData();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Booking Page</h1>
      {doctor && (
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-2xl font-semibold text-blue-600 m-0">Dr. {doctor.fullname}</h4>
              <span className="flex items-center text-yellow-500 font-bold text-sm bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                <i className="fa-solid fa-star text-xs mr-1"></i> {doctor.avgRating || "0.0"} ({doctor.totalReviews || 0})
              </span>
            </div>
            <p className="mt-4"><b>Fees Per Consultation : </b> ${doctor.fees}</p>
            <p><b>Timings : </b> {doctor.timings && doctor.timings[0]} - {doctor.timings && doctor.timings[1]}</p>
            <p><b>Experience : </b> {doctor.experience}</p>
            <p><b>Specialization : </b> {doctor.specialization}</p>

            {doctor.reviews && doctor.reviews.length > 0 && (
              <div className="mt-8">
                <h5 className="font-bold text-slate-700 mb-4 border-b pb-2">Patient Reviews</h5>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {doctor.reviews.map(rev => (
                    <div key={rev._id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm text-slate-800">{rev.userName}</span>
                        <div className="flex text-yellow-400 text-xs">
                           {[...Array(rev.rating)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 m-0 italic">"{rev.comment}"</p>
                      <span className="absolute bottom-2 right-3 text-[10px] text-slate-400">{moment(rev.createdAt).format("DD MMM YY")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col space-y-4">
            <DatePicker
              format="DD-MM-YYYY"
              className="w-full h-10"
              onChange={(value) => {
                setIsAvailable(false);
                setDate(moment(value.$d).format("DD-MM-YYYY"));
              }}
            />
            <TimePicker
              format="HH:mm"
              className="w-full h-10"
              onChange={(value) => {
                setIsAvailable(false);
                setTime(moment(value.$d).format("HH:mm"));
              }}
            />
            <div>
              <p className="font-semibold mb-1">Medical Document (Optional)</p>
              <input type="file" onChange={(e) => setDocument(e.target.files[0])} className="w-full" />
            </div>
            <button className="bg-blue-100 text-blue-600 py-2 rounded font-semibold hover:bg-blue-200" onClick={handleAvailability}>
              Check Availability
            </button>
            {isAvailable && (
              <button className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700" onClick={handleBooking}>
                Book Now
              </button>
            )}
            <button 
              className="bg-indigo-50 border border-indigo-200 text-indigo-600 py-2 rounded font-semibold hover:bg-indigo-100 flex items-center justify-center gap-2" 
              onClick={() => navigate(`/chat?user=${doctor.userId}&name=${doctor.fullname}`)}
            >
              <i className="fa-regular fa-comment-dots"></i> Message Doctor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDoctor;
