import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { Table, message, Modal, Tabs, Rate, Input as AntInput } from "antd";
import moment from "moment";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { UserContext } from "../components/UserContext";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Video, PhoneOff, Printer, Download, FileText, CheckCircle, Stethoscope } from "lucide-react";

const Appointments = () => {
  const { user } = useContext(UserContext);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Telemedicine States
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState("");
  const socketRef = useRef(null);

  // Review States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewingDoctorId, setReviewingDoctorId] = useState(null);

  const getAppointments = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + "/api/user/user-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrintPrescription = () => {
    const printContent = document.getElementById("prescription-letterhead");
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription_RX_${selectedAppointment?._id?.slice(-6)?.toUpperCase() || "DOC"}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }
            .logo-title { font-size: 26px; font-weight: 900; color: #1d4ed8; letter-spacing: -0.5px; }
            .rx-badge { font-size: 13px; font-weight: bold; background: #eff6ff; color: #1e40af; padding: 6px 14px; border-radius: 999px; border: 1px solid #bfdbfe; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
            .field-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
            .field-val { font-size: 15px; font-weight: 700; color: #0f172a; }
            .section-box { border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 20px; background: #ffffff; }
            .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #2563eb; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
            .rx-symbol { font-size: 32px; font-family: serif; font-weight: bold; color: #2563eb; margin-bottom: 8px; }
            .content-text { font-size: 14px; line-height: 1.7; color: #334155; white-space: pre-line; }
            .footer { border-top: 2px dashed #cbd5e1; padding-top: 20px; margin-top: 40px; display: flex; justify-content: space-between; align-items: center; }
            .verified-stamp { color: #15803d; font-weight: bold; font-size: 13px; }
            @media print {
              body { padding: 20px; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    getAppointments();
  }, []);



  const handleCancel = async (record) => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/user/cancel-appointment",
        { appointmentId: record._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getAppointments();
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to cancel appointment");
    }
  };

  const showDetails = (record) => {
    setSelectedAppointment(record);
    setIsModalOpen(true);
  };

  const openReviewModal = (record) => {
    setReviewingDoctorId(record.doctorId);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async () => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/user/add-review",
        { doctorId: reviewingDoctorId, rating: reviewRating, comment: reviewComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        setIsReviewModalOpen(false);
        setReviewComment("");
        setReviewRating(5);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to submit review");
    }
  };

  const handlePayment = async (appointment) => {
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_API_URL + "/api/payment/create-order",
        { appointmentId: appointment._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!data.success) {
        return message.error(data.message || "Failed to create payment order");
      }

      const order = data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_yourKeyHere",
        amount: order.amount,
        currency: order.currency,
        name: "MediCarePro",
        description: `Consultation fee for Dr. ${appointment.doctorInfo?.fullname}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              import.meta.env.VITE_API_URL + "/api/payment/verify-payment",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                appointmentId: appointment._id,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (verifyRes.data.success) {
              message.success("Payment Successful!");
              getAppointments();
            } else {
              message.error("Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
            message.error("Error verifying payment.");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Failed to initiate payment");
    }
  };

  const startVideoCall = (record) => {
    setActiveRoomId(`medicare-consult-${record._id}`);
    setIsVideoCallOpen(true);
  };

  const columns = [
    {
      title: "Doctor Name",
      dataIndex: "doctorInfo",
      render: (text, record) => <span className="font-semibold text-slate-800">Dr. {record.doctorInfo?.fullname || 'Unknown'}</span>,
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      render: (text, record) => (
        <span className="text-slate-600">
          {moment(record.date).format("DD-MM-YYYY")} &nbsp;
          {moment(record.time).format("HH:mm")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${text === 'completed' ? 'bg-green-100 text-green-700' : text === 'cancelled' ? 'bg-slate-100 text-slate-600' : text === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {text}
        </span>
      )
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      render: (text, record) => (
        <div className="flex flex-col gap-1 items-start">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${text === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {text || 'unpaid'}
          </span>
          {(!text || text === 'unpaid') && record.status !== 'cancelled' && record.status !== 'rejected' && (
            <button
              onClick={() => handlePayment(record)}
              className="mt-1 bg-blue-600 text-white px-2 py-1 text-[11px] font-semibold rounded hover:bg-blue-700 border-none cursor-pointer"
            >
              Pay Now (${record.doctorInfo?.fees || 0})
            </button>
          )}
        </div>
      )
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="flex space-x-2">
          {record.status === "approved" && (
            <button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer font-semibold border-none flex items-center gap-2"
              onClick={() => startVideoCall(record)}
            >
              <i className="fa-solid fa-video"></i> Join Call
            </button>
          )}
          {(record.status === "pending" || record.status === "approved") && (
            <button
              className="bg-white border border-red-200 text-red-500 px-3 py-1.5 rounded hover:bg-red-50 cursor-pointer transition font-medium"
              onClick={() => handleCancel(record)}
            >
              Cancel
            </button>
          )}
          {record.status === "completed" && (
            <div className="flex space-x-2">
              <button
                className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-1.5 rounded hover:bg-indigo-100 cursor-pointer transition font-medium"
                onClick={() => showDetails(record)}
              >
                View Prescription
              </button>
              <button
                className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-1.5 rounded hover:bg-yellow-100 cursor-pointer transition font-medium flex items-center gap-1"
                onClick={() => openReviewModal(record)}
              >
                <i className="fa-solid fa-star"></i> Review
              </button>
            </div>
          )}
        </div>
      ),
    }
  ];

  const activeAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'approved');
  const historyAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'rejected');

  return (
    <div className="p-8 h-full bg-white rounded-2xl shadow-sm border border-slate-100 relative">

      <h1 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">My Appointments</h1>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: <span className="font-medium text-base">Upcoming Appointments</span>,
            children: (
              <div className="overflow-x-auto mt-2">
                <Table columns={columns} dataSource={activeAppointments} rowKey="_id" pagination={{ pageSize: 5 }} />
              </div>
            )
          },
          {
            key: "2",
            label: <span className="font-medium text-base">History</span>,
            children: (
              <div className="overflow-x-auto mt-2">
                <Table columns={columns} dataSource={historyAppointments} rowKey="_id" pagination={{ pageSize: 5 }} />
              </div>
            )
          }
        ]}
      />

      {/* Official Digital Prescription Modal */}
      <Modal 
        title={
          <div className="flex items-center justify-between pr-8 border-b pb-3">
            <span className="text-lg font-black text-slate-800 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} /> Official Digital Prescription
            </span>
          </div>
        } 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        width={720}
        footer={[
          <button
            key="print"
            onClick={handlePrintPrescription}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition border-none cursor-pointer flex items-center gap-2 text-sm shadow-md shadow-blue-500/20"
          >
            <Printer size={16} /> Print / Save as PDF
          </button>,
          <button
            key="close"
            onClick={() => setIsModalOpen(false)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition border-none cursor-pointer text-sm"
          >
            Close
          </button>
        ]}
      >
        {selectedAppointment && (
          <div id="prescription-letterhead" className="mt-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-800">
            {/* Letterhead Header */}
            <div className="header flex justify-between items-start border-b-2 border-blue-600 pb-4 mb-6">
              <div>
                <h2 className="logo-title text-2xl font-black text-blue-700 tracking-tight m-0">MediCarePro Health Network</h2>
                <p className="text-xs text-slate-500 font-semibold m-0 mt-0.5">Telemedicine & Clinical Healthcare Systems</p>
                <p className="text-[11px] text-slate-400 m-0">Verified Teleconsultation Electronic Medical Record</p>
              </div>
              <div className="text-right">
                <span className="rx-badge inline-block bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  RX #{selectedAppointment._id.slice(-6).toUpperCase()}
                </span>
                <p className="text-xs text-slate-500 font-medium m-0 mt-2">
                  Date: {moment(selectedAppointment.date).format("DD MMM YYYY")}
                </p>
              </div>
            </div>

            {/* Doctor and Patient Summary */}
            <div className="grid-2 grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
              <div>
                <p className="field-label text-[11px] font-black text-slate-400 uppercase tracking-wider m-0">Attending Physician</p>
                <p className="field-val text-base font-extrabold text-slate-800 m-0 mt-0.5">Dr. {selectedAppointment.doctorInfo?.fullname}</p>
                <p className="text-xs text-blue-600 font-bold m-0">{selectedAppointment.doctorInfo?.specialization}</p>
                <p className="text-[11px] text-slate-500 m-0">Exp: {selectedAppointment.doctorInfo?.experience || "N/A"}</p>
              </div>
              <div>
                <p className="field-label text-[11px] font-black text-slate-400 uppercase tracking-wider m-0">Patient Name</p>
                <p className="field-val text-base font-extrabold text-slate-800 m-0 mt-0.5">{selectedAppointment.userInfo?.name || user?.name}</p>
                <p className="text-xs text-slate-600 font-medium m-0">Email: {selectedAppointment.userInfo?.email || user?.email}</p>
                <p className="text-[11px] text-slate-500 m-0">Consultation Time: {moment(selectedAppointment.time).format("HH:mm")}</p>
              </div>
            </div>

            {/* Clinical Diagnosis / Notes */}
            <div className="section-box border border-slate-200 rounded-xl p-4 mb-4 bg-white">
              <div className="section-title text-xs font-black uppercase text-blue-600 flex items-center gap-2 mb-2 tracking-wider">
                <Stethoscope size={15} /> Clinical Diagnosis & Doctor's Notes
              </div>
              <p className="content-text text-sm leading-relaxed text-slate-700 whitespace-pre-line m-0">
                {selectedAppointment.notes || "Standard clinical review conducted. No specific adverse complications reported."}
              </p>
            </div>

            {/* Rx Prescriptions */}
            <div className="section-box border border-slate-200 rounded-xl p-4 mb-5 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="rx-symbol text-2xl font-black text-blue-600 font-serif">Rx</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Medical Prescription</span>
              </div>
              <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4">
                <p className="content-text text-sm leading-relaxed font-mono text-slate-800 whitespace-pre-line m-0 font-medium">
                  {selectedAppointment.prescription || "No medicinal drugs prescribed. Maintain routine hydration and health precautions."}
                </p>
              </div>
            </div>

            {/* Footer with Digital Verification Stamp */}
            <div className="footer border-t border-slate-200 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <CheckCircle size={15} /> Digitally Signed & Verified by Dr. {selectedAppointment.doctorInfo?.fullname}
              </div>
              <p className="text-[10px] text-slate-400 m-0 italic">
                Valid electronic prescription compliant with Telemedicine Practice Guidelines.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        title={<span className="text-xl font-bold text-slate-800">Rate & Review</span>}
        open={isReviewModalOpen}
        onOk={handleReviewSubmit}
        onCancel={() => setIsReviewModalOpen(false)}
        okText="Submit Review"
        okButtonProps={{ className: "bg-blue-600 font-semibold" }}
      >
        <div className="mt-4 space-y-4">
          <div>
            <p className="font-semibold text-slate-700 mb-2">Rating</p>
            <Rate value={reviewRating} onChange={setReviewRating} className="text-yellow-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-700 mb-2">Comment</p>
            <AntInput.TextArea 
              rows={4} 
              value={reviewComment} 
              onChange={e => setReviewComment(e.target.value)} 
              placeholder="How was your consultation?"
              className="rounded-lg"
            />
          </div>
        </div>
      </Modal>

      {/* Telemedicine Video Modal */}
      <Modal
        title={<span className="text-xl font-bold text-slate-800"><i className="fa-solid fa-video text-green-500 mr-2"></i> MediCare Telemedicine</span>}
        open={isVideoCallOpen}
        onCancel={() => setIsVideoCallOpen(false)}
        footer={null}
        width={1000}
        destroyOnClose
        centered
        styles={{ body: { height: '70vh', padding: 0, background: '#1e293b', overflow: 'hidden' } }}
      >
        {isVideoCallOpen && (
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={activeRoomId}
            configOverwrite={{
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableModeratorIndicator: true,
              enableEmailInStats: false
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
            }}
            userInfo={{
              displayName: user?.name || "Patient"
            }}
            getIFrameRef={(iframeRef) => { iframeRef.style.height = '100%'; }}
          />
        )}
      </Modal>
    </div>
  );
};

export default Appointments;
