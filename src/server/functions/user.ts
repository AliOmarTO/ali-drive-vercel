// returns all images for the user

import { createSupabaseClient } from '../../../utils/supabase/client';

export const fetchImagesPathForUser = async (
  userId: string,
  page: number = 1
): Promise<{ images: { user_id: string; filename: string; storage_path: string; mime_type: string }[]; totalCount: number }> => {
  const PAGE_SIZE = 10;
  const supabase = createSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('images')
      .select('user_id, filename, storage_path, mime_type')
      .eq('user_id', userId)
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (error) {
      console.error('Error fetching images:', error);
      throw new Error('Error fetching images');
    }

    const { count } = await supabase.from('images').select('*', { count: 'exact', head: true });

    return {
      images: data || [],
      totalCount: count || 0, // This can be useful if you want to display the total number of pages
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    return { images: [], totalCount: 0 };
  }
};
