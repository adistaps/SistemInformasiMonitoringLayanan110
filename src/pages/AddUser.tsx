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
    
    if (!formData.nama || !formData.jabatan || !formData.unit_kerja || !formData.email || !formData.telepon) {
      toast({
        title: "Form Tidak Lengkap",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email Tidak Valid",
        description: "Mohon masukkan alamat email yang valid",
        variant: "destructive",
      });
      return;
    }

    try {
      const profileData = {
        nama: formData.nama,
        nrp: formData.nrp || generateNRP(),
        jabatan: formData.jabatan,
        unit_kerja: formData.unit_kerja,
        email: formData.email,
        telepon: formData.telepon,
        role: formData.role,
        status: 'aktif', // default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await createProfileMutation.mutateAsync(profileData);
      navigate('/users');
    } catch (error) {
      console.error("Error creating user:", error);
      // Error handling sudah dilakukan di hook useCreateProfile
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit_kerja">Unit Kerja *</Label>
                      <Select 
                        value={formData.unit_kerja} 
                        onValueChange={(value) => handleInputChange('unit_kerja', value)}
                        disabled={createProfileMutation.isPending}
                      >
                        <SelectTrigger>
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
                        <SelectTrigger>
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
