import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import sendEmail from "../utils/sendEmail.js";
import moment from "moment";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({
      success: true,
      message: "users data list",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "error while fetching users", error });
  }
};

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).send({
      success: true,
      message: "Doctors Data list",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "error while getting doctors data", error });
  }
};

// Get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({});
    res.status(200).send({
      success: true,
      message: "Appointments Data list",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "error while getting appointments data", error });
  }
};

// Change account status
export const changeAccountStatus = async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(doctorId, { status });
    
    if (!doctor) {
      return res.status(404).send({ success: false, message: "Doctor not found" });
    }

    const user = await User.findOne({ _id: doctor.userId });
    
    if (!user) {
      return res.status(404).send({ success: false, message: "Associated user not found" });
    }
    
    if (user) {
      const notification = user.notification || [];
      notification.push({
        type: "doctor-account-request-updated",
        message: `Your Doctor Account Request Has ${status}`,
        onClickPath: "/notifications",
      });
      user.notification = notification;
      
      // if approved, mark user as doctor
      if(status === 'approved') {
        user.isDoctor = true;
      } else {
        user.isDoctor = false;
      }
      
      await user.save();
      
      // Feature 3: Send Email
      await sendEmail({
        email: user.email,
        subject: `Your Doctor Account Request is ${status}`,
        message: `Hello ${user.name},\n\nYour recent application to be a doctor on MediCarePro has been ${status}.\n\nLog in to your account for more details.\n\nThanks,\nMediCarePro Team`
      });
    }
    res.status(200).send({
      success: true,
      message: "Account Status Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error in Account Status", error });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalDoctors = await Doctor.countDocuments({});
    const totalAppointments = await Appointment.countDocuments({});

    const allAppointments = await Appointment.find({});
    
    // Group by Date for the chart
    const dateMap = {};
    allAppointments.forEach(app => {
       const dateString = moment(app.date).format("DD MMM, YYYY");
       dateMap[dateString] = (dateMap[dateString] || 0) + 1;
    });
    
    const chartData = Object.keys(dateMap).map(key => ({
       date: key,
       appointments: dateMap[key]
    }));

    res.status(200).send({
      success: true,
      message: "Analytics fetched",
      data: {
        totalUsers,
        totalDoctors,
        totalAppointments,
        chartData
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error fetching analytics", error });
  }
};