
import { Bell, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/useReports";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: reports = [] } = useReports();

  // Get recent reports for notifications (last 3 reports with status 'menunggu')
  const recentReports = reports
    .filter(report => report.status === 'menunggu')
    .slice(0, 3);

  const notificationCount = recentReports.length;

  const handleNotificationClick = (reportId: string) => {
    navigate(`/reports/${reportId}`);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b">
                <h3 className="font-semibold">Notifikasi</h3>
                <p className="text-sm text-gray-500">{notificationCount} laporan menunggu</p>
              </div>
              {recentReports.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  Tidak ada notifikasi baru
                </div>
              ) : (
                recentReports.map((report) => (
                  <DropdownMenuItem 
                    key={report.id} 
                    className="p-3 border-b cursor-pointer"
                    onClick={() => handleNotificationClick(report.id)}
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Laporan Baru</span>
                        <Badge className="text-xs bg-yellow-500">Menunggu</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{report.judul}</p>
                      <p className="text-sm text-gray-600">{report.lokasi}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(report.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <div className="p-2">
                <Button 
                  variant="ghost" 
                  className="w-full text-sm"
                  onClick={() => navigate('/reports')}
                >
                  Lihat Semua Laporan
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="p-2 text-sm text-gray-600">
                {user?.email}
              </div>
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <span className="mr-2">⚙️</span>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <span className="mr-2">🚪</span>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
