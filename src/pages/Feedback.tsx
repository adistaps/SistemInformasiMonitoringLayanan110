
import { useState } from "react";
import { MessageSquare, Star, Upload, Send, BarChart3, TrendingUp } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import FeedbackExcelUpload from "@/components/FeedbackExcelUpload";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useCreateFeedback, useUploadFeedbackPhoto, useFeedbackStats } from "@/hooks/useFeedback";
import { useAuth } from "@/hooks/useAuth";

const Feedback = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    feedback_type: "",
    subject: "",
    message: "",
    rating: 0,
    email: "",
    nama: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hoveredRating, setHoveredRating] = useState(0);

  const createFeedbackMutation = useCreateFeedback();
  const uploadPhotoMutation = useUploadFeedbackPhoto();
  const { data: feedbackStats, refetch: refetchStats } = useFeedbackStats();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "File harus berupa gambar (JPG, PNG, dll.)",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error", 
          description: "Ukuran file maksimal 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.feedback_type || !formData.subject || !formData.message || !formData.rating || !formData.nama) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi termasuk nama.",
        variant: "destructive"
      });
      return;
    }

    try {
      let photoUrl = null;
      
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name, selectedFile.size);
        const filename = `${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        photoUrl = await uploadPhotoMutation.mutateAsync({ file: selectedFile, filename });
        console.log('File uploaded successfully:', photoUrl);
      }

      const feedbackData = {
        user_id: user?.id || null,
        feedback_type: formData.feedback_type,
        subject: formData.subject,
        message: formData.message,
        rating: formData.rating,
        email: formData.email || user?.email || null,
        photo_url: photoUrl,
        status: 'menunggu',
        nama: formData.nama
      };

      console.log('Submitting feedback:', feedbackData);
      await createFeedbackMutation.mutateAsync(feedbackData);
      
      // Reset form
      setFormData({
        feedback_type: "",
        subject: "",
        message: "",
        rating: 0,
        email: "",
        nama: "",
      });
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('photo') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Refresh statistics
      refetchStats();
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, rating: star })}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hoveredRating || formData.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1">
        <Header title="Feedback" />
        
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Feedback & Saran</h1>
            <p className="text-gray-600">Berikan feedback untuk membantu kami meningkatkan layanan</p>
          </div>

          {/* Statistik Feedback */}
          {feedbackStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Total Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{feedbackStats.total || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating Rata-rata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{feedbackStats.averageRating?.toFixed(1) || '0.0'}</div>
                  <div className="flex mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(feedbackStats.averageRating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Feedback Hari Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{feedbackStats.todayCount || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Feedback Terbanyak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium capitalize">
                    {feedbackStats.byType && Object.keys(feedbackStats.byType).length > 0 
                      ? Object.entries(feedbackStats.byType).sort(([,a], [,b]) => (Number(b) - Number(a)))[0]?.[0] || 'N/A'
                      : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {feedbackStats.byType && Object.keys(feedbackStats.byType).length > 0 
                      ? Object.entries(feedbackStats.byType).sort(([,a], [,b]) => (Number(b) - Number(a)))[0]?.[1] || 0
                      : 0} feedback
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Upload Excel */}
          <div className="mb-6">
            <FeedbackExcelUpload />
          </div>

          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Kirim Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nama">Nama *</Label>
                      <Input
                        id="nama"
                        value={formData.nama}
                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
                        placeholder="Nama lengkap Anda"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="feedback_type">Jenis Feedback *</Label>
                      <Select value={formData.feedback_type} onValueChange={(value) => setFormData({...formData, feedback_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis feedback" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saran">Saran</SelectItem>
                          <SelectItem value="keluhan">Keluhan</SelectItem>
                          <SelectItem value="pujian">Pujian</SelectItem>
                          <SelectItem value="bug_report">Laporan Bug</SelectItem>
                          <SelectItem value="fitur_request">Permintaan Fitur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Email Anda (opsional)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subjek *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Masukkan subjek feedback"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Pesan *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Tuliskan feedback Anda di sini..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label>Rating Kepuasan *</Label>
                    <div className="mt-2">
                      {renderStarRating()}
                      <p className="text-sm text-gray-500 mt-1">
                        Berikan rating dari 1-5 bintang (Rating saat ini: {formData.rating}/5)
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="photo">Upload Foto (Opsional)</Label>
                    <div className="mt-2">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: JPG, PNG, maksimal 5MB
                      </p>
                      {selectedFile && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-700">
                            File dipilih: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createFeedbackMutation.isPending || uploadPhotoMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {createFeedbackMutation.isPending || uploadPhotoMutation.isPending 
                      ? "Mengirim..." 
                      : "Kirim Feedback"
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Feedback;
