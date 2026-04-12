import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import sendEmail from "../utils/sendEmail.js";

export const getDoctorInfo = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.userId });
    res.status(200).send({
      success: true,
      message: "Doctor data fetch success",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error in Fetching Doctor Details" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate({ userId: req.userId }, req.body, { new: true });
    res.status(200).send({
      success: true,
      message: "Doctor Profile Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Doctor Profile Update issue", error });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.doctorId }).lean();
    
    // Fetch reviews
    const reviews = await Review.find({ doctorId: doctor._id }).sort({ createdAt: -1 });
    const totalRating = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
    
    // Populate user details in reviews
    const populatedReviews = await Promise.all(reviews.map(async (rev) => {
      const user = await User.findById(rev.userId).select("name");
      return { ...rev._doc, userName: user ? user.name : "Anonymous" };
    }));

    doctor.avgRating = avgRating;
    doctor.totalReviews = reviews.length;
    doctor.reviews = populatedReviews;

    res.status(200).send({
      success: true,
      message: "Single Doctor Info Fetched",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error in Single Doctor info" });
  }
};

export const doctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.userId });
    const appointments = await Appointment.find({ doctorId: doctor._id });
    res.status(200).send({
      success: true,
      message: "Doctor Appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error in Doc Appointments" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    const appointments = await Appointment.findByIdAndUpdate(appointmentsId, { status }, { new: true });
    
    // Notify user
    const user = await User.findOne({ _id: appointments.userId });
    if(user) {
      const notification = user.notification || [];
      notification.push({
        type: "status-updated",
        message: `Your appointment has been ${status}`,
        onClickPath: "/appointments",
      });
      user.notification = notification;
      await user.save();
      
      // Feature 3
      await sendEmail({
        email: user.email,
        subject: `Your Appointment was ${status}`,
        message: `Hello ${user.name},\n\nYour appointment has been ${status}. Please log in to view the details.\n\nBest,\nMediCarePro`
      });
    }
    res.status(200).send({
      success: true,
      message: "Appointment Status Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error in Update Status" });
  }
};

export const updateConsultation = async (req, res) => {
  try {
    const { appointmentsId, notes, prescription } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentsId,
      { status: "completed", notes, prescription },
      { new: true }
    );
    
    // Notify user
    const user = await User.findOne({ _id: appointment.userId });
    if (user) {
      const notification = user.notification || [];
      notification.push({
        type: "consultation-completed",
        message: `Consultation with Dr. ${appointment.doctorInfo.fullname} is complete. View details.`,
        onClickPath: "/appointments",
      });
      user.notification = notification;
      await user.save();
      
      // Feature 3
      await sendEmail({
        email: user.email,
        subject: `Consultation Completed`,
        message: `Hello ${user.name},\n\nYour consultation is complete. Prescription and notes have been added to your profile.\n\nBest,\nMediCarePro`
      });
    }
    
    res.status(200).send({
      success: true,
      message: "Consultation Completed and Notes Added",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error in Completing Consultation" });
  }
};