import { useState } from "react";
import { Menu, X, Home, FileText, Users, Settings, BarChart3, Download, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.ico" alt="Logo" className="w-6 h-6" />
          <div>
            <h1 className="text-sm font-bold text-gray-900">Sistem Informasi</h1>
            <p className="text-xs text-gray-600">Monitoring Layanan 110</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div className={cn(
        "lg:hidden fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 z-50 transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/favicon.ico" alt="Logo" className="w-6 h-6" />
              <div>
                <h1 className="text-sm font-bold text-gray-900">Sistem Informasi</h1>
                <p className="text-xs text-gray-600">Monitoring Layanan 110</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium transition-colors",
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
    </>
  );
};

export default MobileNav;