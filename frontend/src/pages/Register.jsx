import React from "react";
import { Form, Input, message, Button } from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const onfinishHandler = async (values) => {
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + "/api/auth/register", values);
      if (res.data.success) {
        message.success("Register Successfully!");
        navigate("/login");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      message.error("Something Went Wrong");
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
         {/* Left Side Form */}
         <div className="w-1/2 flex justify-start items-center pr-10">
             <div className="w-full max-w-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Sign up to your account</h2>
                
                <Form layout="vertical" onFinish={onfinishHandler} className="space-y-3">
                <Form.Item label={<span className="font-semibold text-gray-700 text-xs">Name</span>} name="name" rules={[{ required: true, message: 'Please input your name!' }]} className="mb-0">
                    <Input type="text" placeholder="John Doe" className="h-10 border-none rounded-full px-4 shadow-sm" />
                </Form.Item>
                <Form.Item label={<span className="font-semibold text-gray-700 text-xs">Email</span>} name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]} className="mb-0">
                    <Input type="email" placeholder="john@example.com" className="h-10 border-none rounded-full px-4 shadow-sm" />
                </Form.Item>
                <Form.Item label={<span className="font-semibold text-gray-700 text-xs">Password</span>} name="password" rules={[{ required: true, message: 'Please input your password!' }]} className="mb-4">
                    <Input.Password placeholder="********" className="h-10 border-none rounded-full px-4 shadow-sm" />
                </Form.Item>
                
                <Button htmlType="submit" className="w-40 h-10 bg-yellow-400 font-bold hover:bg-yellow-500 rounded-full border-none text-gray-800 shadow mx-auto block mb-4">
                    Register
                </Button>
                
                <div className="text-center mt-2">
                    <Link to="/login" className="text-xs text-gray-600 hover:text-gray-900 underline">
                    Already a user? Login here
                    </Link>
                </div>
                </Form>
             </div>
         </div>

         {/* Right Side Illustration */}
         <div className="w-1/2 flex items-center justify-center">
           <img 
             src="/images/register_doctor.png" 
             alt="Consulting" 
             className="w-full max-w-md object-contain mix-blend-multiply drop-shadow-xl"
           />
         </div>
      </div>
    </div>
  );
};

export default Register;