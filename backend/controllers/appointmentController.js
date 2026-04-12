import Appointment from "../models/Appointment.js";

export const bookAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create({
      ...req.body,
      userId: req.userId   // 🔥 logged user
    });

    res.json(appointment);

  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getAppointments = async (req, res) => {
  const appointments = await Appointment.find()
    .populate("userId")
    .populate("doctorId");

  res.json(appointments);
};