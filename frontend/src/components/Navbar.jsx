import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { useContext } from "react";
import { Badge } from "antd";

function Navbar() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // roles
  const userMenu = [
    { name: "Home", path: "/" },
    { name: "Appointments", path: "/appointments" },
    { name: "Apply Doctor", path: "/apply-doctor" },
  ];

  const adminMenu = [
    { name: "Home", path: "/" },
    { name: "Doctors", path: "/admin" },
    { name: "Users", path: "/admin/users" },
  ];

  const doctorMenu = [
    { name: "Home", path: "/" },
    { name: "Appointments", path: "/doctor-appointments" },
    { name: "Profile", path: `/doctor/profile/${user?._id}` },
  ];

  const menuToBeRendered = user?.isAdmin
    ? adminMenu
    : user?.isDoctor
    ? doctorMenu
    : userMenu;

  return (
    <div className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="font-bold text-xl cursor-pointer" onClick={() => navigate("/")}>
        Book a Doctor
      </h1>

      <div className="flex items-center space-x-6">
        {menuToBeRendered.map((menu) => (
          <Link key={menu.name} to={menu.path} className="hover:text-blue-200">
            {menu.name}
          </Link>
        ))}

        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate("/notifications")}>
          <Badge count={user?.notification?.length || 0}>
            <i className="fa-solid fa-bell text-white text-xl"></i>
          </Badge>
          <Link to="/profile" className="font-semibold uppercase ml-2">{user?.name}</Link>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;