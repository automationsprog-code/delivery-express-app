import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function uploadAvatarToStorage(file, riderId = 'avatar') {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const ext = file.name ? file.name.split('.').pop() : 'jpg';
    const filePath = `rider-${riderId}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('rider-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }
    const { data: urlData } = supabase.storage.from('rider-avatars').getPublicUrl(filePath);
    return urlData.publicUrl;
  } catch (err) {
    console.error('Failed to upload avatar to storage:', err);
    return null;
  }
}
