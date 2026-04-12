import React, { useEffect, useState, useContext } from "react";
import { Form, Row, Col, Input, TimePicker, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { motion } from "framer-motion";
import { UserContext } from "../../components/UserContext";

const Profile = () => {
  const { user } = useContext(UserContext);
  const [doctor, setDoctor] = useState(null);
  const navigate = useNavigate();
  const params = useParams();

  // Fetch specific doctor data
  const getDoctorInfo = async () => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/doctor/get-doctor-info",
        { userId: params.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  useEffect(() => {
    getDoctorInfo();
    // eslint-disable-next-line
  }, []);

  const handleFinish = async (values) => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/doctor/update-profile",
        {
          ...values,
          userId: user._id,
          timings: [
            moment(values.timings[0]).format("HH:mm"),
            moment(values.timings[1]).format("HH:mm"),
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        navigate("/");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      message.error("Something went wrong");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl shadow-sm">
          <i className="fa-solid fa-user-doctor"></i>
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 m-0 tracking-tight">Manage Profile</h1>
          <p className="text-slate-500 font-medium m-0 text-sm">Keep your professional details up to date.</p>
        </div>
      </div>

      {doctor && (
        <Form
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            ...doctor,
            timings: [
              moment(doctor.timings[0], "HH:mm"),
              moment(doctor.timings[1], "HH:mm"),
            ],
          }}
          className="bg-white p-8 shadow-xl border border-slate-100 rounded-3xl"
        >
          <div className="mb-8">
            <h4 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-address-card text-blue-500"></i> Personal Details
            </h4>
            <Row gutter={24}>
              <Col xs={24} md={24} lg={8}>
                <Form.Item label={<span className="font-semibold text-slate-700">Full Name</span>} name="fullname" required rules={[{ required: true }]}>
                  <Input type="text" placeholder="Dr. John Doe" className="rounded-xl py-2 border-slate-200" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item label={<span className="font-semibold text-slate-700">Email Address</span>} name="email" required rules={[{ required: true }]}>
                  <Input type="email" placeholder="john@hospital.com" className="rounded-xl py-2 border-slate-200" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item label={<span className="font-semibold text-slate-700">Contact Number</span>} name="phone" required rules={[{ required: true }]}>
                  <Input type="text" placeholder="+1 234 567 890" className="rounded-xl py-2 border-slate-200" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={24}>
                <Form.Item label={<span className="font-semibold text-slate-700">Clinic Address</span>} name="address" required rules={[{ required: true }]}>
                  <Input type="text" placeholder="123 Medical Drive, Suite 100" className="rounded-xl py-2 border-slate-200" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-stethoscope text-indigo-500"></i> Professional Details
            </h4>
            <Row gutter={24}>
              <Col xs={24} md={24} lg={8}>
                <Form.Item label={<span className="font-semibold text-slate-700">Specialization</span>} name="specialization" required rules={[{ required: true }]}>
                  <Input type="text" placeholder="Cardiologist" className="rounded-xl py-2 border-slate-200" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item label={<span className="font-semibold text-slate-700">Experience (Years)</span>} name="experience" required rules={[{ required: true }]}>
                  <Input type="text" placeholder="5" className="rounded-xl py-2 border-slate-200" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item label={<span className="font-semibold text-slate-700">Consultation Fee</span>} name="fees" required rules={[{ required: true }]}>
                  <Input type="number" placeholder="150" className="rounded-xl py-2 border-slate-200" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item label={<span className="font-semibold text-slate-700">Working Hours</span>} name="timings" required rules={[{ required: true }]}>
                  <TimePicker.RangePicker format="HH:mm" className="w-full rounded-xl py-2 border-slate-200" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="flex justify-end mt-4 pt-6 border-t border-slate-100">
            <button 
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-indigo-500/30 font-bold hover:-translate-y-0.5 transition-all cursor-pointer border-none" 
              type="submit"
            >
              Update Profile Information
            </button>
          </div>
        </Form>
      )}
    </motion.div>
  );
};

export default Profile;
