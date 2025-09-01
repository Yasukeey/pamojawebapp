'use server';

import { createSupabaseServerClient } from '@/supabase/supabaseServer';
import { User } from '@/types/app';
import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseServerClientPages from '@/supabase/supabaseSeverPages';

export const getUserData = async (): Promise<User | null> => {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('NO USER OR AUTH ERROR:', authError);
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single(); // Use .single() instead of accessing data[0]

    if (error) {
      console.error('Database error:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Unexpected error in getUserData:', error);
    return null;
  }
};

export const getUserDataPages = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | null> => {
  try {
    const supabase = supabaseServerClientPages(req, res);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('NO USER OR AUTH ERROR (pages):', authError);
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Database error (pages):', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Unexpected error in getUserDataPages:', error);
    return null;
  }
};