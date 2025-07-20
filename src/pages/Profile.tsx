
import React, { useState } from "react";
import { User, Edit, Save, Camera, Shield, Clock, MapPin } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile, useChangePassword } from "@/hooks/useProfile";

const Profile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nama: "",
    nomor_telepon: "",
    unit_kerja: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setProfileData({
        nama: profile.nama || "",
        nomor_telepon: profile.nomor_telepon || "",
        unit_kerja: profile.unit_kerja || "",
        email: profile.email || "",
      });
    } else if (user && !profile) {
      setProfileData({
        nama: "",
        nomor_telepon: "",
        unit_kerja: "",
        email: user.email || "",
      });
    }
  }, [profile, user]);

  const activityLog = [
    {
      id: 1,
      action: "Login ke sistem",
      timestamp: "2024-01-16 09:30:15",
      ip: "192.168.1.100",
      device: "Chrome on Windows"
    },
    {
      id: 2,
      action: "Melihat laporan RPT001",
      timestamp: "2024-01-16 09:25:30",
      ip: "192.168.1.100",
      device: "Chrome on Windows"
    },
    {
      id: 3,
      action: "Update status laporan",
      timestamp: "2024-01-16 08:45:22",
      ip: "192.168.1.100",
      device: "Chrome on Windows"
    },
    {
      id: 4,
      action: "Download laporan bulanan",
      timestamp: "2024-01-15 16:20:18",
      ip: "192.168.1.100",
      device: "Chrome on Windows"
    }
  ];

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      alert("Mohon lengkapi semua field password");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Password baru dan konfirmasi password tidak cocok");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword
    });
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Header title="Profile" />
          <main className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat profile...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        <Header title="Profile" />
        
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Kelola informasi profil dan pengaturan akun Anda</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informasi Personal
                    </CardTitle>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Simpan
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="text-lg">AS</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Ganti Foto
                      </Button>
                    )}
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="nama">Nama Lengkap</Label>
                       <Input
                         id="nama"
                         value={profileData.nama}
                         onChange={(e) => setProfileData({...profileData, nama: e.target.value})}
                         disabled={!isEditing}
                         placeholder="Masukkan nama lengkap"
                       />
                     </div>
                     <div>
                       <Label htmlFor="email">Email</Label>
                       <Input
                         id="email"
                         type="email"
                         value={profileData.email}
                         disabled={true}
                       />
                     </div>
                     <div>
                       <Label htmlFor="unit_kerja">Unit Kerja</Label>
                       <Input
                         id="unit_kerja"
                         value={profileData.unit_kerja}
                         onChange={(e) => setProfileData({...profileData, unit_kerja: e.target.value})}
                         disabled={!isEditing}
                         placeholder="Masukkan unit kerja"
                       />
                     </div>
                     <div>
                       <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                       <Input
                         id="nomor_telepon"
                         value={profileData.nomor_telepon}
                         onChange={(e) => setProfileData({...profileData, nomor_telepon: e.target.value})}
                         disabled={!isEditing}
                         placeholder="Masukkan nomor telepon"
                       />
                     </div>
                   </div>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Ubah Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                      placeholder="Masukkan password saat ini"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      placeholder="Masukkan password baru"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      placeholder="Konfirmasi password baru"
                    />
                  </div>
                  <Button onClick={handleChangePassword} className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Ubah Password
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Akun</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge className="bg-green-500">Aktif</Badge>
                    </div>
                     <div className="flex items-center justify-between">
                       <span className="text-sm">Role</span>
                       <Badge className="bg-blue-500">{profile?.role || 'Petugas'}</Badge>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-sm">Email</span>
                       <span className="text-sm text-gray-500">{user?.email}</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-sm">Member Since</span>
                       <span className="text-sm text-gray-500">
                         {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Baru'}
                       </span>
                     </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Log */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Aktivitas Terbaru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityLog.slice(0, 4).map((activity) => (
                      <div key={activity.id} className="text-sm">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-gray-500 text-xs">{activity.timestamp}</p>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      Lihat Semua Aktivitas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
