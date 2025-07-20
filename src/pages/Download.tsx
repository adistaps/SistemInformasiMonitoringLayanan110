import { useState } from "react";
import { Download as DownloadIcon, FileText, FileSpreadsheet, Calendar, Filter } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useReports } from "@/hooks/useReports";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const Download = () => {
  // Menggunakan React Query hook
  const { data: reports = [], isLoading, error } = useReports();
  
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    kategori: "",
    prioritas: ""
  });

  // Error handling untuk React Query
  if (error) {
    console.error('Error loading reports:', error);
  }

  const filteredReports = reports.filter(report => {
    const reportDate = new Date(report.created_at);
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    if (startDate && reportDate < startDate) return false;
    if (endDate && reportDate > endDate) return false;
    if (filters.status && filters.status !== "all" && report.status !== filters.status) return false;
    if (filters.kategori && filters.kategori !== "all" && report.kategori !== filters.kategori) return false;
    if (filters.prioritas && filters.prioritas !== "all" && report.prioritas !== filters.prioritas) return false;

    return true;
  });

  const downloadExcel = () => {
    if (filteredReports.length === 0) {
      toast({
        title: "Tidak Ada Data",
        description: "Tidak ada laporan yang sesuai dengan filter",
        variant: "destructive"
      });
      return;
    }

    try {
      const excelData = filteredReports.map(report => ({
        "Nomor Laporan": report.nomor_laporan,
        "Judul": report.judul,
        "Deskripsi": report.deskripsi,
        "Kategori": report.kategori,
        "Status": report.status,
        "Prioritas": report.prioritas,
        "Lokasi": report.lokasi,
        "Pelapor": report.pelapor_nama,
        "Telepon Pelapor": report.pelapor_telepon,
        "Email Pelapor": report.pelapor_email,
        "Tanggal Laporan": new Date(report.created_at).toLocaleDateString('id-ID'),
        "Petugas": report.petugas?.nama || '-',
        "Catatan Petugas": report.catatan_petugas || '-',
        "Tanggal Selesai": report.tanggal_selesai ? new Date(report.tanggal_selesai).toLocaleDateString('id-ID') : '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
      
      const filename = `laporan_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);

      toast({
        title: "Download Berhasil",
        description: `${filteredReports.length} laporan berhasil didownload sebagai Excel`
      });
    } catch (error) {
      console.error('Excel download error:', error);
      toast({
        title: "Error",
        description: "Gagal mendownload file Excel",
        variant: "destructive"
      });
    }
  };

  const downloadPDF = () => {
    if (filteredReports.length === 0) {
      toast({
        title: "Tidak Ada Data",
        description: "Tidak ada laporan yang sesuai dengan filter",
        variant: "destructive"
      });
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Laporan SIMOLA 110', 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 20, 30);
      doc.text(`Total Records: ${filteredReports.length}`, 20, 40);

      // Prepare table data
      const tableData = filteredReports.map(report => [
        report.nomor_laporan,
        report.judul,
        report.kategori,
        report.status,
        report.pelapor_nama,
        new Date(report.created_at).toLocaleDateString('id-ID')
      ]);

      // Add table
      doc.autoTable({
        head: [['No. Laporan', 'Judul', 'Kategori', 'Status', 'Pelapor', 'Tanggal']],
        body: tableData,
        startY: 50,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      const filename = `laporan_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      toast({
        title: "Download Berhasil",
        description: `${filteredReports.length} laporan berhasil didownload sebagai PDF`
      });
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Error",
        description: "Gagal mendownload file PDF",
        variant: "destructive"
      });
    }
  };

  const downloadCSV = () => {
    if (filteredReports.length === 0) {
      toast({
        title: "Tidak Ada Data",
        description: "Tidak ada laporan yang sesuai dengan filter",
        variant: "destructive"
      });
      return;
    }

    try {
      const csvData = filteredReports.map(report => ({
        nomor_laporan: report.nomor_laporan,
        judul: report.judul,
        deskripsi: report.deskripsi,
        kategori: report.kategori,
        status: report.status,
        prioritas: report.prioritas,
        lokasi: report.lokasi,
        pelapor_nama: report.pelapor_nama,
        pelapor_telepon: report.pelapor_telepon,
        pelapor_email: report.pelapor_email,
        tanggal_laporan: new Date(report.created_at).toLocaleDateString('id-ID'),
        petugas: report.petugas?.nama || '',
        catatan_petugas: report.catatan_petugas || '',
        tanggal_selesai: report.tanggal_selesai ? new Date(report.tanggal_selesai).toLocaleDateString('id-ID') : ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(csvData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
      
      const filename = `laporan_${new Date().toISOString().split('T')[0]}.csv`;
      XLSX.writeFile(workbook, filename, { bookType: 'csv' });

      toast({
        title: "Download Berhasil",
        description: `${filteredReports.length} laporan berhasil didownload sebagai CSV`
      });
    } catch (error) {
      console.error('CSV download error:', error);
      toast({
        title: "Error",
        description: "Gagal mendownload file CSV",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Header title="Download Reports" />
          <main className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Header title="Download Reports" />
          <main className="p-6">
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
              <p className="text-gray-600">Gagal memuat data laporan. Silakan refresh halaman atau hubungi administrator.</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Refresh Halaman
              </Button>
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
        <Header title="Download Reports" />
        
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Download Laporan</h1>
            <p className="text-gray-600">Unduh laporan dalam berbagai format</p>
          </div>

          {/* Filter Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Laporan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="startDate">Tanggal Mulai</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">Tanggal Akhir</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="menunggu">Menunggu</SelectItem>
                      <SelectItem value="diproses">Diproses</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                      <SelectItem value="ditolak">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="kategori">Kategori</Label>
                  <Select value={filters.kategori} onValueChange={(value) => setFilters({...filters, kategori: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      <SelectItem value="kecelakaan">Kecelakaan</SelectItem>
                      <SelectItem value="pencurian">Pencurian</SelectItem>
                      <SelectItem value="kekerasan">Kekerasan</SelectItem>
                      <SelectItem value="penipuan">Penipuan</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prioritas">Prioritas</Label>
                  <Select value={filters.prioritas} onValueChange={(value) => setFilters({...filters, prioritas: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Prioritas</SelectItem>
                      <SelectItem value="rendah">Rendah</SelectItem>
                      <SelectItem value="sedang">Sedang</SelectItem>
                      <SelectItem value="tinggi">Tinggi</SelectItem>
                      <SelectItem value="darurat">Darurat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Data yang akan diunduh:</strong> {filteredReports.length} dari {reports.length} laporan
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Download Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  Excel Format
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Download laporan dalam format Excel (.xlsx) dengan semua detail lengkap.
                </p>
                <Button onClick={downloadExcel} className="w-full">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download Excel
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  PDF Format
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Download laporan dalam format PDF untuk pencetakan dan arsip.
                </p>
                <Button onClick={downloadPDF} variant="outline" className="w-full">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  CSV Format
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Download laporan dalam format CSV untuk analisis data.
                </p>
                <Button onClick={downloadCSV} variant="outline" className="w-full">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Download;