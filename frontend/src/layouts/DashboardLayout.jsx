import { Link } from "react-router-dom";

function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5">
        <h2 className="text-2xl font-bold mb-6">Admin</h2>

        <div className="space-y-4">
          <Link to="/admin" className="block hover:text-blue-400">
            Dashboard
          </Link>
          <Link to="/" className="block hover:text-blue-400">
            Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-100 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;