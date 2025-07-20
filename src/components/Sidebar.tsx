
import { Home, FileText, Users, Settings, BarChart3, Download, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dasbor", path: "/dashboard" },
    { icon: FileText, label: "Laporan", path: "/reports" },
    { icon: Users, label: "Pengguna", path: "/users" },
    { icon: BarChart3, label: "Statistik", path: "/statistics" },
    { icon: Download, label: "Unduh Laporan", path: "/download" },
    { icon: MessageSquare, label: "Masukan", path: "/feedback" },
    { icon: User, label: "Profil", path: "/profile" },
    { icon: Settings, label: "Pengaturan", path: "/settings" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen lg:block hidden">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src="/favicon.ico" alt="Logo" className="w-8 h-8" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">Sistem Informasi</h1>
            <p className="text-sm text-gray-600">Monitoring Layanan 110</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-none transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900 border-r-2 border-blue-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
