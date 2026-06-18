import Razorpay from "razorpay";
import Appointment from "../models/Appointment.js";
import crypto from "crypto";

export const createOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).send({ success: false, message: "Appointment not found" });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).send({
        success: false,
        message: "Razorpay keys are not configured in .env",
      });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const amount = (appointment.doctorInfo.fees || 500) * 100; // in paise (e.g. 500 INR = 50000 paise)
    const options = {
      amount,
      currency: "INR",
      receipt: appointmentId.toString(),
    };

    const order = await razorpay.orders.create(options);
    
    // Save order ID to the appointment
    appointment.razorpayOrderId = order.id;
    await appointment.save();

    res.status(200).send({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).send({ success: false, message: "Error creating Razorpay order", error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, appointmentId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).send({ success: false, message: "Appointment not found" });
      }

      appointment.paymentStatus = "paid";
      appointment.razorpayPaymentId = razorpay_payment_id;
      await appointment.save();

      return res.status(200).send({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      return res.status(400).send({ success: false, message: "Invalid signature verification" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).send({ success: false, message: "Error verifying payment", error: error.message });
  }
};
