import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Review from "../models/Review.js";
import moment from "moment";

export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId }).select("-password");
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    } else {
      res.status(200).send({ success: true, data: user });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Auth error", success: false, error });
  }
};

export const applyDoctor = async (req, res) => {
  try {
    const newDoctor = await Doctor.create({ ...req.body, userId: req.userId, status: "pending" });
    const adminUser = await User.findOne({ isAdmin: true });
    if (adminUser) {
      const notification = adminUser.notification;
      notification.push({
        type: "apply-doctor-request",
        message: `${newDoctor.fullname} has applied for a doctor account`,
        data: {
          doctorId: newDoctor._id,
          name: newDoctor.fullname,
          onClickPath: "/admin",
        },
      });
      await User.findByIdAndUpdate(adminUser._id, { notification });
    }
    res.status(200).send({ success: true, message: "Doctor Account Applied Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error while Applying For Doctor" });
  }
};

export const markAllNotifications = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    const unseen = user.notification;
    const seen = user.seenNotifications;
    seen.push(...unseen);
    user.notification = [];
    user.seenNotifications = seen;
    const updatedUser = await user.save();
    
    const userObj = updatedUser.toObject();
    delete userObj.password;

    res.status(200).send({
      success: true,
      message: "all notifications marked as read",
      data: userObj,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in notification", success: false, error });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    user.notification = [];
    user.seenNotifications = [];
    const updatedUser = await user.save();

    const userObj = updatedUser.toObject();
    delete userObj.password;

    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: userObj,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "unable to delete all notifications", error });
  }
};

export const getAllApprovedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "approved" }).lean();
    
    // Attach average ratings
    const doctorsWithRatings = await Promise.all(
      doctors.map(async (doc) => {
        const reviews = await Review.find({ doctorId: doc._id });
        const totalRating = reviews.reduce((acc, rev) => acc + rev.rating, 0);
        const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
        return { ...doc, avgRating, totalReviews: reviews.length };
      })
    );

    res.status(200).send({ success: true, message: "Doctors Lists Fetched Successfully", data: doctorsWithRatings });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error While Fetching Doctors" });
  }
};

export const addReview = async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;
    const existingReview = await Review.findOne({ userId: req.userId, doctorId });
    if (existingReview) {
      return res.status(200).send({ success: false, message: "You have already reviewed this doctor." });
    }
    await Review.create({ userId: req.userId, doctorId, rating, comment });
    res.status(200).send({ success: true, message: "Review Submitted Successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error Submitting Review" });
  }
};

// Book Appointment
export const bookAppointment = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const time = moment(req.body.time, "HH:mm").toISOString();
    
    // Parse JSON strings from formData
    const doctorInfo = typeof req.body.doctorInfo === "string" ? JSON.parse(req.body.doctorInfo) : req.body.doctorInfo;
    const userInfo = typeof req.body.userInfo === "string" ? JSON.parse(req.body.userInfo) : req.body.userInfo;

    // Add document upload path if exists
    let documentPath = "";
    if (req.file) {
      documentPath = `/uploads/${req.file.filename}`;
    }

    req.body.status = "pending";
    const newAppointment = new Appointment({
      ...req.body,
      doctorInfo,
      userInfo,
      date,
      time,
      document: documentPath,
      userId: req.userId
    });
    await newAppointment.save();

    const user = await User.findOne({ _id: doctorInfo.userId });
    if (user) {
      const notification = user.notification || [];
      notification.push({
        type: "new-appointment-request",
        message: `A new appointment request from ${userInfo.name}`,
        onClickPath: "/doctor-appointments",
      });
      user.notification = notification;
      await user.save();
    }
    
    res.status(200).send({ success: true, message: "Appointment Booked successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error While Booking Appointment" });
  }
};

// Check Availability
export const checkAvailability = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hours").toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    
    const doctorId = req.body.doctorId;
    
    const appointments = await Appointment.find({
      doctorId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });
    
    if (appointments.length > 0) {
      return res.status(200).send({ message: "Appointments not available at this time", success: false });
    } else {
      return res.status(200).send({ success: true, message: "Appointments available" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error In Check Availability" });
  }
};

// User Appointments
export const userAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.userId });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetched Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error In User Appointments" });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status: "cancelled" }, { new: true });
    
    const user = await User.findOne({ _id: appointment.doctorInfo.userId });
    if (user) {
      const notification = user.notification || [];
      notification.push({
        type: "appointment-cancelled",
        message: `An appointment with ${appointment.userInfo.name} has been cancelled`,
        onClickPath: "/doctor-appointments",
      });
      user.notification = notification;
      await user.save();
    }

    res.status(200).send({
      success: true,
      message: "Appointment Cancelled Successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error Cancelling Appointment" });
  }
};
