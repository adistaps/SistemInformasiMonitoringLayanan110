
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ArrowLeft } from "lucide-react";

type UserRole = "admin" | "petugas" | "dispatcher";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    role: "petugas" as UserRole,
    nomor_telepon: "",
    unit_kerja: ""
  });

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        nama: data.nama || "",
        email: data.email || "",
        role: (data.role as UserRole) || "petugas",
        nomor_telepon: data.nomor_telepon || "",
        unit_kerja: data.unit_kerja || ""
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nama: formData.nama,
          email: formData.email,
          role: formData.role,
          nomor_telepon: formData.nomor_telepon,
          unit_kerja: formData.unit_kerja,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data pengguna berhasil diperbarui"
      });

      navigate('/users');
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data pengguna",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData({...formData, role: value as UserRole});
  };

  if (loading) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        <Header title="Edit Pengguna" />
        
        <main className="p-6">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/users')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar Pengguna
            </Button>
            
            <h1 className="text-2xl font-bold text-gray-900">Edit Pengguna</h1>
            <p className="text-gray-600">Perbarui informasi pengguna</p>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Informasi Pengguna</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <Input
                      id="nama"
                      value={formData.nama}
                      onChange={(e) => setFormData({...formData, nama: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={handleRoleChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="petugas">Petugas</SelectItem>
                        <SelectItem value="dispatcher">Dispatcher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                    <Input
                      id="nomor_telepon"
                      value={formData.nomor_telepon}
                      onChange={(e) => setFormData({...formData, nomor_telepon: e.target.value})}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="unit_kerja">Unit Kerja</Label>
                    <Input
                      id="unit_kerja"
                      value={formData.unit_kerja}
                      onChange={(e) => setFormData({...formData, unit_kerja: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/users')}>
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default EditUser;
