import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/user/get-user-info",
        { token: localStorage.getItem("token") },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        localStorage.clear();
      }
    } catch (error) {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      getUser();
    }
  }, []);

  if (localStorage.getItem("token")) {
    if (loading) return <div>Loading...</div>;
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}
