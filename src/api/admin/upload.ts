// Admin Upload API for frontend-only store
// Uses Supabase Storage for file uploads
import { supabase } from '@/lib/supabaseClient';

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    fileName: string;
    size: number;
    path?: string;
  };
  error?: string;
}

// Upload file to Supabase Storage
export const uploadFile = async (file: File, folder = 'uploads'): Promise<UploadResponse> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`.replace(/^\/+/, ''); // Remove leading slash

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return {
      success: true,
      data: {
        url: publicUrlData.publicUrl,
        fileName: file.name,
        size: file.size,
        path: data.path,
      },
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
};

// Upload multiple files
export const uploadFiles = async (files: File[], folder = 'uploads'): Promise<UploadResponse[]> => {
  const uploadPromises = files.map(file => uploadFile(file, folder));
  return Promise.all(uploadPromises);
};

// Delete file from Supabase Storage
export const deleteFile = async (filePath: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error.message || 'Delete failed',
    };
  }
};