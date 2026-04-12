import React, { useState } from "react";
import { Form, Input, message, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const handleSendOTP = async (values) => {
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + "/api/auth/forgot-password", { email: values.email });
      if (res.data.success) {
        message.success(res.data.message);
        setEmail(values.email);
        setStep(2);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      message.error("Something went wrong");
    }
  };

  const handleResetPassword = async (values) => {
    try {
      const payload = { email, otp: values.otp, newPassword: values.newPassword };
      const res = await axios.post(import.meta.env.VITE_API_URL + "/api/auth/reset-password", payload);
      if (res.data.success) {
        message.success(res.data.message);
        navigate("/login");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      message.error("Something went wrong");
    }
  };

  return (
    <div className="flex h-screen bg-[#bcc6c5]">
      {/* Top Left logo */}
      <div className="absolute top-6 left-8">
        <div 
          className="bg-yellow-400 px-4 py-2 rounded shadow-sm cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <h1 className="text-gray-800 text-lg font-extrabold uppercase tracking-wide m-0 leading-none">
            Book A Doctor
          </h1>
        </div>
      </div>

      <div className="flex w-full mt-24 max-w-6xl mx-auto px-10">
         {/* Left Side Illustration */}
         <div className="w-1/2 flex items-center justify-center">
           <img 
            src="/images/login_doctor.png" 
            alt="Consulting Isometric" 
            className="w-full max-w-md object-contain mix-blend-multiply drop-shadow-xl"
           />
         </div>

         {/* Right Side Form */}
         <div className="w-1/2 flex justify-start items-center pl-10">
            <div className="w-full max-w-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">
                   {step === 1 ? "Reset Password" : "Enter Passcode"}
                </h2>
                
                {step === 1 ? (
                  <Form layout="vertical" onFinish={handleSendOTP} className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Enter your email address and we'll send you a 6-digit passcode.</p>
                    <Form.Item label={<span className="font-semibold text-gray-700 text-xs">Email</span>} name="email" rules={[{ required: true, type: 'email' }]} className="mb-6">
                        <Input type="email" placeholder="john@example.com" className="h-10 border-none rounded-full px-4 shadow-sm" />
                    </Form.Item>
                    
                    <Button htmlType="submit" className="w-40 h-10 bg-yellow-400 font-bold hover:bg-yellow-500 rounded-full border-none text-gray-800 shadow mx-auto block mb-4">
                        Send Passcode
                    </Button>
                    
                    <div className="text-center mt-2">
                        <Link to="/login" className="text-xs text-gray-600 hover:text-gray-900 underline">
                          Back to Login
                        </Link>
                    </div>
                  </Form>
                ) : (
                  <Form layout="vertical" onFinish={handleResetPassword} className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">We sent a passcode to <b>{email}</b></p>
                    
                    <Form.Item label={<span className="font-semibold text-gray-700 text-xs">6-Digit Passcode</span>} name="otp" rules={[{ required: true }]} className="mb-2">
                        <Input placeholder="123456" maxLength={6} className="h-10 border-none rounded-full px-4 shadow-sm text-center tracking-widest text-lg font-mono" />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold text-gray-700 text-xs">New Password</span>} name="newPassword" rules={[{ required: true }]} className="mb-6">
                        <Input.Password placeholder="********" className="h-10 border-none rounded-full px-4 shadow-sm" />
                    </Form.Item>
                    
                    <Button htmlType="submit" className="w-40 h-10 bg-yellow-400 font-bold hover:bg-yellow-500 rounded-full border-none text-gray-800 shadow mx-auto block mb-4">
                        Reset Password
                    </Button>
                    
                    <div className="text-center mt-2">
                        <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline bg-transparent border-none cursor-pointer">
                          Try a different email
                        </button>
                    </div>
                  </Form>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
