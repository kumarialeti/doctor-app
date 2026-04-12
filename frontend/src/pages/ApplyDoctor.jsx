import React, { useContext } from "react";
import { Form, Row, Col, Input, TimePicker, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { UserContext } from "../components/UserContext";

const ApplyDoctor = () => {
  const { user, fetchUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleFinish = async (values) => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/user/apply-doctor",
        {
          ...values,
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
        fetchUser();
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
    <div className="p-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Apply Doctor</h1>
      <Form layout="vertical" onFinish={handleFinish} className="bg-white p-6 shadow-md rounded-md">
        <h4 className="text-xl font-semibold mb-4 text-blue-500">Personal Details</h4>
        <Row gutter={20}>
          <Col xs={24} md={24} lg={8}>
            <Form.Item label="Full Name" name="fullname" required rules={[{ required: true }]}>
              <Input type="text" placeholder="your good name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item label="Email" name="email" required rules={[{ required: true }]}>
              <Input type="email" placeholder="your email address" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item label="Phone No" name="phone" required rules={[{ required: true }]}>
              <Input type="text" placeholder="your contact no" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item label="Address" name="address" required rules={[{ required: true }]}>
              <Input type="text" placeholder="your clinic address" />
            </Form.Item>
          </Col>
        </Row>
        <h4 className="text-xl font-semibold mb-4 mt-4 text-blue-500">Professional Details</h4>
        <Row gutter={20}>
          <Col xs={24} md={24} lg={8}>
            <Form.Item label="Specialization" name="specialization" required rules={[{ required: true }]}>
              <Input type="text" placeholder="your specialization" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item label="Experience" name="experience" required rules={[{ required: true }]}>
              <Input type="text" placeholder="your experience" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item label="Fees Per Consultation" name="fees" required rules={[{ required: true }]}>
              <Input type="number" placeholder="your contact no" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item label="Timings" name="timings" required rules={[{ required: true }]}>
              <TimePicker.RangePicker format="HH:mm" />
            </Form.Item>
          </Col>
        </Row>
        <div className="flex justify-end mt-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold" type="submit">
            Submit
          </button>
        </div>
      </Form>
    </div>
  );
};

export default ApplyDoctor;