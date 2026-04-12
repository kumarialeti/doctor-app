import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Table, message, Modal, Tabs, Rate, Input as AntInput } from "antd";
import moment from "moment";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { UserContext } from "../components/UserContext";

const Appointments = () => {
  const { user } = useContext(UserContext);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Telemedicine States
  // Telemedicine States
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState("");

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

      {/* Prescription Details Modal */}
      <Modal 
        title={<span className="text-xl font-bold text-slate-800">Consultation Details</span>} 
        open={isModalOpen} 
        onOk={() => setIsModalOpen(false)} 
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <button key="back" onClick={() => setIsModalOpen(false)} className="bg-slate-100 text-slate-800 px-6 py-2 rounded-lg font-semibold hover:bg-slate-200 transition border-none cursor-pointer">
            Close
          </button>
        ]}
      >
        {selectedAppointment && (
          <div className="mt-6 space-y-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><i className="fa-solid fa-stethoscope text-blue-500"></i> Doctor's Notes</h4>
              <p className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-slate-700 whitespace-pre-line leading-relaxed shadow-sm">
                {selectedAppointment.notes || "No notes provided."}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><i className="fa-solid fa-pills text-indigo-500"></i> Prescription</h4>
              <p className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-slate-700 whitespace-pre-line leading-relaxed shadow-sm">
                {selectedAppointment.prescription || "No prescription provided."}
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
