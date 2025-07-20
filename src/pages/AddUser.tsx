
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
import { toast } from "@/components/ui/use-toast";

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: "",
    nrp: "",
    jabatan: "",
    unit: "",
    email: "",
    telepon: "",
    status: "Aktif",
    role: "User"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama || !formData.jabatan || !formData.unit || !formData.email || !formData.telepon) {
      toast({
        title: "Form Tidak Lengkap",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    const newUser = {
      ...formData,
      id: `USR${Date.now().toString().slice(-3)}`,
      nrp: formData.nrp || generateNRP(),
      lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    // Simpan ke localStorage
    const existingUsers = localStorage.getItem('users');
    const users = existingUsers ? JSON.parse(existingUsers) : [];
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    toast({
      title: "Pengguna Berhasil Ditambahkan",
      description: `${formData.nama} telah ditambahkan ke sistem`,
    });

    navigate('/users');
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="nrp">NRP (Opsional)</Label>
                      <Input
                        id="nrp"
                        value={formData.nrp}
                        onChange={(e) => handleInputChange('nrp', e.target.value)}
                        placeholder="NRP akan digenerate otomatis jika kosong"
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit Kerja *</Label>
                      <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
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
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aktif">Aktif</SelectItem>
                          <SelectItem value="Non-Aktif">Non-Aktif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Supervisor">Supervisor</SelectItem>
                          <SelectItem value="Operator">Operator</SelectItem>
                          <SelectItem value="User">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Simpan Pengguna
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/users')}>
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
