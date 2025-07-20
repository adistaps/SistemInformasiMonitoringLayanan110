
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      console.log('Fetching reports...');
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          petugas:petugas_id(nama)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }
      
      console.log('Reports fetched:', data?.length || 0);
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

export const useReport = (reportId: string) => {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      console.log('Fetching report by ID:', reportId);
      
      // Try to find by nomor_laporan first (LP001, LP002 format)
      let { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          petugas:petugas_id(nama)
        `)
        .eq('nomor_laporan', reportId)
        .maybeSingle();
      
      // If not found by nomor_laporan, try by id
      if (!data && !error) {
        const result = await supabase
          .from('reports')
          .select(`
            *,
            petugas:petugas_id(nama)
          `)
          .eq('id', reportId)
          .maybeSingle();
        
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        console.error('Error fetching report:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Laporan tidak ditemukan');
      }
      
      console.log('Report fetched:', data);
      return data;
    },
    enabled: !!reportId,
  });
};

export const useReportsStats = () => {
  return useQuery({
    queryKey: ['reports-stats'],
    queryFn: async () => {
      console.log('Fetching reports stats...');
      const { data, error } = await supabase
        .from('reports')
        .select('status, kategori, prioritas, created_at');
      
      if (error) {
        console.error('Error fetching reports stats:', error);
        throw error;
      }
      
      const reports = data || [];
      const today = new Date().toDateString();
      
      const stats = {
        total: reports.length,
        todayReports: reports.filter(r => new Date(r.created_at).toDateString() === today).length,
        byStatus: {
          menunggu: reports.filter(r => r.status === 'menunggu').length,
          diproses: reports.filter(r => r.status === 'diproses').length,
          selesai: reports.filter(r => r.status === 'selesai').length,
          ditolak: reports.filter(r => r.status === 'ditolak').length,
        },
        byCategory: reports.reduce((acc, r) => {
          acc[r.kategori] = (acc[r.kategori] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        emergency: reports.filter(r => r.prioritas === 'darurat').length,
      };
      
      console.log('Reports stats:', stats);
      return stats;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportData: any) => {
      console.log('Creating report with data:', reportData);
      
      const { data, error } = await supabase
        .from('reports')
        .insert({
          nomor_laporan: '', // Will be set by trigger to LP001, LP002, etc.
          judul: `${reportData.jenis} - ${reportData.lokasi}`,
          kategori: reportData.kategori as any,
          lokasi: reportData.lokasi,
          deskripsi: reportData.deskripsi || '',
          pelapor_nama: reportData.pelapor,
          pelapor_telepon: reportData.telepon || null,
          pelapor_email: reportData.email || null,
          prioritas: (reportData.prioritas?.toLowerCase() || 'sedang') as any,
          status: 'menunggu' as any,
          tanggal_laporan: new Date().toISOString(),
          koordinat_lat: reportData.koordinat ? parseFloat(reportData.koordinat.split(',')[0]) : null,
          koordinat_lng: reportData.koordinat ? parseFloat(reportData.koordinat.split(',')[1]) : null,
          petugas_nama: reportData.petugasNama || null,
          petugas_polres: reportData.petugasPolres || null,
          petugas_hp: reportData.petugasHp || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating report:', error);
        throw error;
      }
      
      console.log('Report created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Report creation successful, refreshing queries...');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-stats'] });
      toast({
        title: "Laporan Berhasil Dibuat",
        description: `Laporan ${data.nomor_laporan} telah ditambahkan ke sistem.`,
      });
    },
    onError: (error) => {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "Gagal membuat laporan baru. Silakan coba lagi.",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      console.log('Updating report:', id, updateData);
      
      const { data, error } = await supabase
        .from('reports')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating report:', error);
        throw error;
      }
      
      console.log('Report updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Report update successful, refreshing queries...');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-stats'] });
      queryClient.invalidateQueries({ queryKey: ['report', data?.id] });
      queryClient.invalidateQueries({ queryKey: ['report', data?.nomor_laporan] });
      toast({
        title: "Laporan Berhasil Diperbarui",
        description: "Data laporan telah diperbarui.",
      });
    },
    onError: (error) => {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui laporan.",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportId: string) => {
      console.log('Deleting report:', reportId);
      
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);
      
      if (error) {
        console.error('Error deleting report:', error);
        throw error;
      }
      
      console.log('Report deleted successfully');
    },
    onSuccess: () => {
      console.log('Report deletion successful, refreshing queries...');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-stats'] });
      toast({
        title: "Laporan Dihapus",
        description: "Laporan berhasil dihapus dari sistem.",
      });
    },
    onError: (error) => {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus laporan.",
        variant: "destructive"
      });
    }
  });
};
