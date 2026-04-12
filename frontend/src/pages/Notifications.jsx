import React, { useContext } from "react";
import { Tabs, message } from "antd";
import { UserContext } from "../components/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const { user, fetchUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleMarkAllRead = async () => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/user/mark-all-notifications",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        fetchUser();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      message.error("Something went wrong");
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/user/delete-all-notifications",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        fetchUser();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      message.error("Something went wrong");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Notifications</h1>
      <Tabs
        items={[
          {
            key: "0",
            label: "Unread",
            children: (
              <div>
                <div className="flex justify-end p-2">
                  <h4 className="p-2 cursor-pointer text-blue-500 font-semibold" onClick={handleMarkAllRead}>
                    Mark All Read
                  </h4>
                </div>
                {user?.notification.map((notificationMgs, index) => (
                  <div key={index} className="bg-white p-4 shadow-sm mb-2 rounded cursor-pointer hover:bg-gray-50 border-l-4 border-blue-500" onClick={() => navigate(notificationMgs.onClickPath)}>
                    <div>{notificationMgs.message}</div>
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: "1",
            label: "Read",
            children: (
              <div>
                <div className="flex justify-end p-2">
                  <h4 className="p-2 cursor-pointer text-red-500 font-semibold" onClick={handleDeleteAllRead}>
                    Delete All Read
                  </h4>
                </div>
                {user?.seenNotifications.map((notificationMgs, index) => (
                  <div key={index} className="bg-white p-4 shadow-sm mb-2 rounded cursor-pointer hover:bg-gray-50 border-l-4 border-gray-400" onClick={() => navigate(notificationMgs.onClickPath)}>
                    <div>{notificationMgs.message}</div>
                  </div>
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Notifications;
