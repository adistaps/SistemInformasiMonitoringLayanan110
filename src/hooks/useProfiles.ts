import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Utility function to check authentication
const checkAuth = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error('Authentication check failed:', error);
    throw new Error('User not authenticated');
  }
  return user;
};

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      console.log('🔍 Fetching profiles...');
      
      try {
        // Check authentication first
        await checkAuth();
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('❌ Error fetching profiles:', error);
          throw error;
        }
        
        console.log('✅ Profiles fetched successfully:', data?.length || 0, 'records');
        return data || [];
      } catch (error) {
        console.error('❌ Failed to fetch profiles:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProfilesStats = () => {
  return useQuery({
    queryKey: ['profiles-stats'],
    queryFn: async () => {
      console.log('🔍 Fetching profiles stats...');
      
      try {
        await checkAuth();
        
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('role');
        
        if (error) {
          console.error('❌ Error fetching profiles stats:', error);
          throw error;
        }
        
        const total = profiles?.length || 0;
        const byRole = {
          admin: profiles?.filter(p => p.role === 'admin').length || 0,
          petugas: profiles?.filter(p => p.role === 'petugas').length || 0,
          dispatcher: profiles?.filter(p => p.role === 'dispatcher').length || 0,
        };
        
        console.log('✅ Profiles stats calculated:', { total, byRole });
        return { total, byRole };
      } catch (error) {
        console.error('❌ Failed to fetch profiles stats:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProfile = (profileId: string) => {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      console.log('🔍 Fetching profile by ID:', profileId);
      
      try {
        await checkAuth();
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .maybeSingle();
        
        if (error) {
          console.error('❌ Error fetching profile:', error);
          throw error;
        }
        
        console.log('✅ Profile fetched:', data);
        return data;
      } catch (error) {
        console.error('❌ Failed to fetch profile:', error);
        throw error;
      }
    },
    enabled: !!profileId,
    retry: 2,
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: any) => {
      console.log('🚀 Starting profile creation process...');
      console.log('📝 Profile data received:', profileData);
      
      try {
        // Check authentication
        const user = await checkAuth();
        console.log('✅ User authenticated:', user.id);
        
        // Validate required fields
        const requiredFields = ['nama', 'jabatan', 'unit_kerja', 'email', 'telepon', 'role'];
        const missingFields = requiredFields.filter(field => !profileData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        
        // Check for existing email
        console.log('🔍 Checking for existing email...');
        const { data: existingProfiles, error: checkError } = await supabase
          .from('profiles')
          .select('email, nrp')
          .or(`email.eq.${profileData.email},nrp.eq.${profileData.nrp}`);
          
        if (checkError) {
          console.error('❌ Error checking existing profiles:', checkError);
          throw checkError;
        }
        
        if (existingProfiles && existingProfiles.length > 0) {
          const existingEmail = existingProfiles.find(p => p.email === profileData.email);
          const existingNRP = existingProfiles.find(p => p.nrp === profileData.nrp);
          
          if (existingEmail) {
            throw new Error('Email sudah digunakan oleh pengguna lain');
          }
          if (existingNRP) {
            throw new Error('NRP sudah digunakan oleh pengguna lain');
          }
        }
        
        // Prepare final data
        const finalData = {
          ...profileData,
          email: profileData.email.toLowerCase().trim(),
          nama: profileData.nama.trim(),
          jabatan: profileData.jabatan.trim(),
          telepon: profileData.telepon.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('💾 Inserting profile data:', finalData);
        
        // Insert data
        const { data, error } = await supabase
          .from('profiles')
          .insert([finalData])
          .select()
          .single();
        
        if (error) {
          console.error('❌ Supabase insertion error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        
        console.log('✅ Profile created successfully:', data);
        return data;
        
      } catch (error: any) {
        console.error('❌ Profile creation failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Profile creation successful, invalidating queries...');
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles-stats'] });
      
      // Optionally refetch immediately
      queryClient.refetchQueries({ queryKey: ['profiles'] });
      
      toast({
        title: "Berhasil!",
        description: `Pengguna ${data.nama} berhasil ditambahkan ke sistem.`,
      });
    },
    onError: (error: any) => {
      console.error('💥 Profile creation mutation error:', error);
      
      let errorTitle = "Gagal Membuat Pengguna";
      let errorDescription = "Terjadi kesalahan saat membuat pengguna baru.";
      
      // Handle specific Supabase errors
      if (error.code === '23505') {
        errorTitle = "Data Duplikat";
        if (error.message?.includes('email')) {
          errorDescription = "Email sudah digunakan oleh pengguna lain";
        } else if (error.message?.includes('nrp')) {
          errorDescription = "NRP sudah digunakan oleh pengguna lain";
        } else {
          errorDescription = "Data yang Anda masukkan sudah ada dalam sistem";
        }
      } else if (error.code === '42501') {
        errorTitle = "Akses Ditolak";
        errorDescription = "Anda tidak memiliki izin untuk membuat pengguna baru";
      } else if (error.code === '23502') {
        errorTitle = "Data Tidak Lengkap";
        errorDescription = "Beberapa field wajib tidak diisi dengan benar";
      } else if (error.code === '23514') {
        errorTitle = "Data Tidak Valid";
        errorDescription = "Format data tidak sesuai dengan ketentuan";
      } else if (error.message?.includes('duplicate')) {
        errorTitle = "Data Duplikat";
        errorDescription = "Email atau NRP sudah digunakan";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorTitle = "Masalah Koneksi";
        errorDescription = "Periksa koneksi internet Anda dan coba lagi";
      } else if (error.message?.includes('auth') || error.message?.includes('unauthorized')) {
        errorTitle = "Masalah Autentikasi";
        errorDescription = "Silakan login ulang dan coba lagi";
      } else if (error.message?.includes('Email sudah digunakan') || error.message?.includes('NRP sudah digunakan')) {
        errorTitle = "Data Duplikat";
        errorDescription = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive"
      });
    }
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      console.log('🔄 Updating profile:', id, updateData);
      
      try {
        await checkAuth();
        
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('❌ Error updating profile:', error);
          throw error;
        }
        
        console.log('✅ Profile updated successfully:', data);
        return data;
      } catch (error) {
        console.error('❌ Failed to update profile:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Profile update successful, refreshing queries...');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles-stats'] });
      queryClient.invalidateQueries({ queryKey: ['profile', data?.id] });
      toast({
        title: "Berhasil!",
        description: "Data pengguna berhasil diperbarui.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error updating profile:', error);
      
      let errorMessage = "Gagal memperbarui data pengguna";
      
      if (error.code === '23505') {
        errorMessage = "Email atau NRP sudah digunakan oleh pengguna lain";
      } else if (error.code === '42501') {
        errorMessage = "Tidak memiliki izin untuk memperbarui pengguna";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileId: string) => {
      console.log('🗑️ Deleting profile:', profileId);
      
      try {
        await checkAuth();
        
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profileId);
        
        if (error) {
          console.error('❌ Error deleting profile:', error);
          throw error;
        }
        
        console.log('✅ Profile deleted successfully');
        return profileId;
      } catch (error) {
        console.error('❌ Failed to delete profile:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🎉 Profile deletion successful, refreshing queries...');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles-stats'] });
      toast({
        title: "Berhasil!",
        description: "Pengguna berhasil dihapus dari sistem.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error deleting profile:', error);
      
      let errorMessage = "Gagal menghapus pengguna";
      
      if (error.code === '42501') {
        errorMessage = "Tidak memiliki izin untuk menghapus pengguna";
      } else if (error.code === '23503') {
        errorMessage = "Tidak dapat menghapus pengguna yang masih memiliki data terkait";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
};