import { useState } from "react";
import { ArrowLeft, User, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useCreateProfile } from "@/hooks/useProfiles";

const AddUser = () => {
  const navigate = useNavigate();
  const createProfileMutation = useCreateProfile();
  
  const [formData, setFormData] = useState({
    nama: "",
    nrp: "",
    jabatan: "",
    unit_kerja: "",
    email: "",
    telepon: "",
    role: "petugas"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateNRP = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `${year}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Form submission started with data:', formData);
    
    // Validasi field wajib
    const requiredFields = [
      { field: 'nama', label: 'Nama Lengkap' },
      { field: 'jabatan', label: 'Jabatan' },
      { field: 'unit_kerja', label: 'Unit Kerja' },
      { field: 'email', label: 'Email' },
      { field: 'telepon', label: 'Telepon' }
    ];
    
    const missingFields = requiredFields.filter(({ field }) => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(({ label }) => label).join(', ');
      toast({
        title: "Form Tidak Lengkap",
        description: `Field berikut harus diisi: ${missingLabels}`,
        variant: "destructive",
      });
      return;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "Email Tidak Valid",
        description: "Mohon masukkan alamat email yang valid",
        variant: "destructive",
      });
      return;
    }

    // Validasi nomor telepon (basic)
    const phoneRegex = /^[\d\-\+\(\)\s]+$/;
    if (!phoneRegex.test(formData.telepon.trim())) {
      toast({
        title: "Nomor Telepon Tidak Valid",
        description: "Mohon masukkan nomor telepon yang valid",
        variant: "destructive",
      });
      return;
    }

    try {
      const profileData = {
        nama: formData.nama.trim(),
        nrp: formData.nrp?.trim() || generateNRP(),
        jabatan: formData.jabatan.trim(),
        unit_kerja: formData.unit_kerja,
        email: formData.email.trim().toLowerCase(),
        telepon: formData.telepon.trim(),
        role: formData.role,
        status: 'aktif',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📤 Sending profile data to server:', profileData);

      const result = await createProfileMutation.mutateAsync(profileData);
      
      console.log('✅ Profile created successfully:', result);
      
      toast({
        title: "Berhasil!",
        description: `Pengguna ${profileData.nama} berhasil ditambahkan`,
      });
      
      // Reset form
      setFormData({
        nama: "",
        nrp: "",
        jabatan: "",
        unit_kerja: "",
        email: "",
        telepon: "",
        role: "petugas"
      });
      
      // Navigate after a short delay to ensure toast is visible
      setTimeout(() => {
        navigate('/users');
      }, 1000);
      
    } catch (error: any) {
      console.error("❌ Detailed error creating user:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Handle specific error types
      let errorTitle = "Error";
      let errorMessage = "Gagal membuat pengguna baru";
      
      if (error.code === '23505') {
        errorTitle = "Data Duplikat";
        if (error.message?.includes('email')) {
          errorMessage = "Email sudah digunakan oleh pengguna lain";
        } else if (error.message?.includes('nrp')) {
          errorMessage = "NRP sudah digunakan oleh pengguna lain";
        } else {
          errorMessage = "Ada data yang sudah digunakan sebelumnya";
        }
      } else if (error.code === '42501' || error.message?.includes('permission')) {
        errorTitle = "Akses Ditolak";
        errorMessage = "Anda tidak memiliki izin untuk membuat pengguna";
      } else if (error.code === '23502') {
        errorTitle = "Data Tidak Lengkap";
        errorMessage = "Beberapa field wajib tidak diisi dengan benar";
      } else if (error.message?.includes('duplicate')) {
        errorTitle = "Data Duplikat";
        errorMessage = "Email atau NRP sudah digunakan";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorTitle = "Koneksi Bermasalah";
        errorMessage = "Periksa koneksi internet Anda";
      } else if (error.message?.includes('auth')) {
        errorTitle = "Autentikasi Gagal";
        errorMessage = "Silakan login ulang";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        <Header title="Tambah Pengguna" />
        
        <main className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" onClick={() => navigate("/users")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tambah Pengguna Baru</h1>
                <p className="text-gray-600">Tambahkan pengguna baru ke sistem SIMOLA 110</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Pengguna
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nama">Nama Lengkap *</Label>
                      <Input
                        id="nama"
                        value={formData.nama}
                        onChange={(e) => handleInputChange('nama', e.target.value)}
                        placeholder="Nama lengkap pengguna"
                        required
                        disabled={createProfileMutation.isPending}
                        className={createProfileMutation.isPending ? "opacity-50" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nrp">NRP (Opsional)</Label>
                      <Input
                        id="nrp"
                        value={formData.nrp}
                        onChange={(e) => handleInputChange('nrp', e.target.value)}
                        placeholder="NRP akan digenerate otomatis jika kosong"
                        disabled={createProfileMutation.isPending}
                        className={createProfileMutation.isPending ? "opacity-50" : ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jabatan">Jabatan *</Label>
                      <Input
                        id="jabatan"
                        value={formData.jabatan}
                        onChange={(e) => handleInputChange('jabatan', e.target.value)}
                        placeholder="Jabatan pengguna"
                        required
                        disabled={createProfileMutation.isPending}
                        className={createProfileMutation.isPending ? "opacity-50" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit_kerja">Unit Kerja *</Label>
                      <Select 
                        value={formData.unit_kerja} 
                        onValueChange={(value) => handleInputChange('unit_kerja', value)}
                        disabled={createProfileMutation.isPending}
                      >
                        <SelectTrigger className={createProfileMutation.isPending ? "opacity-50" : ""}>
                          <SelectValue placeholder="Pilih unit kerja" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POLDA Daerah Istimewa Yogyakarta">POLDA Daerah Istimewa Yogyakarta</SelectItem>
                          <SelectItem value="Polres Kota Yogyakarta">Polres Kota Yogyakarta</SelectItem>
                          <SelectItem value="Polres Sleman">Polres Sleman</SelectItem>
                          <SelectItem value="Polres Bantul">Polres Bantul</SelectItem>
                          <SelectItem value="Polres Kulon Progo">Polres Kulon Progo</SelectItem>
                          <SelectItem value="Polres Gunung Kidul">Polres Gunung Kidul</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@polri.go.id"
                        required
                        disabled={createProfileMutation.isPending}
                        className={createProfileMutation.isPending ? "opacity-50" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telepon">Telepon *</Label>
                      <Input
                        id="telepon"
                        value={formData.telepon}
                        onChange={(e) => handleInputChange('telepon', e.target.value)}
                        placeholder="0274-xxxxxxx"
                        required
                        disabled={createProfileMutation.isPending}
                        className={createProfileMutation.isPending ? "opacity-50" : ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Role *</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value) => handleInputChange('role', value)}
                        disabled={createProfileMutation.isPending}
                      >
                        <SelectTrigger className={createProfileMutation.isPending ? "opacity-50" : ""}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="dispatcher">Dispatcher</SelectItem>
                          <SelectItem value="petugas">Petugas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status_info">Status</Label>
                      <Input
                        id="status_info"
                        value="Aktif (default)"
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="submit" 
                      className="flex items-center gap-2"
                      disabled={createProfileMutation.isPending}
                    >
                      <Save className="h-4 w-4" />
                      {createProfileMutation.isPending ? "Menyimpan..." : "Simpan Pengguna"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/users')}
                      disabled={createProfileMutation.isPending}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddUser;