
import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { useCreateReport } from "@/hooks/useReports";
import * as XLSX from "xlsx";

interface ExcelReportData {
  judul: string;
  deskripsi: string;
  kategori: string;
  prioritas: string;
  lokasi: string;
  pelapor_nama: string;
  pelapor_telepon?: string;
  pelapor_email?: string;
}

const ReportExcelUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createReportMutation = useCreateReport();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Format File Salah",
        description: "Mohon upload file Excel (.xlsx atau .xls)",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setUploadResults(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        try {
          // Validate required fields
          if (!row.jenis || !row.kategori || !row.lokasi || !row.pelapor) {
            throw new Error(`Baris ${i + 2}: Field wajib tidak lengkap`);
          }

          // Validate jenis
          const validJenis = ['pengaduan', 'informasi', 'prank', 'permintaan'];
          if (!validJenis.includes(row.jenis?.toLowerCase())) {
            throw new Error(`Baris ${i + 2}: Jenis tidak valid (${row.jenis})`);
          }

          // Validate prioritas
          const validPrioritas = ['rendah', 'sedang', 'tinggi', 'darurat'];
          const prioritas = row.prioritas?.toLowerCase() || 'sedang';
          if (!validPrioritas.includes(prioritas)) {
            throw new Error(`Baris ${i + 2}: Prioritas tidak valid (${row.prioritas})`);
          }

          const reportData = {
            jenis: row.jenis.toLowerCase(),
            kategori: row.kategori,
            deskripsi: row.deskripsi || '',
            prioritas: prioritas,
            lokasi: row.lokasi,
            pelapor: row.pelapor,
            telepon: row.telepon || '',
            email: row.email || '',
            petugasNama: row.petugasNama || '',
            petugasPolres: row.petugasPolres || '',
            petugasHp: row.petugasHp || ''
          };

          await createReportMutation.mutateAsync(reportData);
          successCount++;
          
        } catch (error) {
          failedCount++;
          errors.push(error instanceof Error ? error.message : `Baris ${i + 2}: Error tidak diketahui`);
        }
      }

      setUploadResults({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10) // Show only first 10 errors
      });

      if (successCount > 0) {
        toast({
          title: "Upload Berhasil",
          description: `${successCount} laporan berhasil diimport`,
        });
      }

    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast({
        title: "Error",
        description: "Gagal memproses file Excel",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        jenis: "pengaduan",
        kategori: "kecelakaan",
        deskripsi: "Deskripsi detail laporan",
        prioritas: "tinggi",
        lokasi: "Jl. Malioboro, Yogyakarta",
        pelapor: "John Doe",
        telepon: "081234567890",
        email: "john@email.com",
        petugasNama: "Bripka Ahmad",
        petugasPolres: "Polres Kota Yogyakarta",
        petugasHp: "081234567891"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "template_laporan.xlsx");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload Laporan dari Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>Format kolom Excel yang diperlukan:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>jenis</strong> (wajib): pengaduan, informasi, prank, permintaan</li>
            <li><strong>kategori</strong> (wajib): sub kategori sesuai jenis (contoh: kecelakaan untuk pengaduan)</li>
            <li><strong>deskripsi</strong>: Deskripsi laporan</li>
            <li><strong>prioritas</strong>: rendah, sedang, tinggi, darurat (default: sedang)</li>
            <li><strong>lokasi</strong> (wajib): Lokasi kejadian</li>
            <li><strong>pelapor</strong> (wajib): Nama pelapor</li>
            <li><strong>telepon</strong>: Nomor telepon pelapor</li>
            <li><strong>email</strong>: Email pelapor</li>
            <li><strong>petugasNama</strong>: Nama petugas yang menangani</li>
            <li><strong>petugasPolres</strong>: Polres/Unit Kerja</li>
            <li><strong>petugasHp</strong>: Nomor HP petugas</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isProcessing ? "Memproses..." : "Upload Excel"}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />

        {uploadResults && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Hasil Upload:</strong></p>
                <p>✅ Berhasil: {uploadResults.success} laporan</p>
                <p>❌ Gagal: {uploadResults.failed} laporan</p>
                
                {uploadResults.errors.length > 0 && (
                  <div>
                    <p className="font-medium">Error yang ditemukan:</p>
                    <ul className="list-disc list-inside text-sm">
                      {uploadResults.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {uploadResults.errors.length >= 10 && (
                        <li>... dan error lainnya</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportExcelUpload;
