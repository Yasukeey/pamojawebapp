'use server';

import { createSupabaseServerClient } from '@/supabase/supabaseServer';
import { getUserData } from '@/actions/get-user-data';
import { addMemberToWorkspace } from '@/actions/add-member-to-workspace';
import { updateUserWorkspace } from '@/actions/update-user-workspace';
import { Workspace } from '@/types/app';

export const getUserWorkspaceData = async (workspaceIds: Array<string>): Promise<Workspace[]> => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .in('id', workspaceIds);

    if (error) {
      console.error('Error fetching workspaces:', error);
      return [];
    }

    return data as Workspace[] || [];
  } catch (error) {
    console.error('Unexpected error in getUserWorkspaceData:', error);
    return [];
  }
};

export const getCurrentWorksaceData = async (workspaceId: string): Promise<Workspace | null> => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('workspaces')
      .select('*, channels (*)')
      .eq('id', workspaceId)
      .single();

    if (error) {
      console.error('Error fetching current workspace:', error);
      return null;
    }

    if (!data?.members) {
      return data as Workspace;
    }

    // Fetch member details
    const memberDetails = await Promise.all(
      data.members.map(async (memberId: string) => {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', memberId)
            .single();

          if (userError) {
            console.error(`Error fetching user data for member ${memberId}:`, userError);
            return null;
          }

          return userData;
        } catch (err) {
          console.error(`Unexpected error fetching member ${memberId}:`, err);
          return null;
        }
      })
    );

    // Filter out null members and assign back to data
    data.members = memberDetails.filter(member => member !== null);

    return data as Workspace;
  } catch (error) {
    console.error('Unexpected error in getCurrentWorksaceData:', error);
    return null;
  }
};

export const workspaceInvite = async (inviteCode: string): Promise<{ success: boolean; message: string }> => {
  try {
    const supabase = await createSupabaseServerClient();
    const userData = await getUserData();

    if (!userData) {
      return { success: false, message: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();

    if (error || !data) {
      console.error('Error fetching workspace invite:', error);
      return { success: false, message: 'Invalid invite code' };
    }

    // Check if user is already a member
    const isUserMember = data.members?.includes(userData.id);
    if (isUserMember) {
      return { success: false, message: 'You are already a member of this workspace' };
    }

    // Check if user is the super admin
    if (data.super_admin === userData.id) {
      return { success: false, message: 'You are the admin of this workspace' };
    }

    // Add user to workspace
    await addMemberToWorkspace(userData.id, data.id);
    await updateUserWorkspace(userData.id, data.id);

    return { success: true, message: 'Successfully joined workspace' };
  } catch (error) {
    console.error('Unexpected error in workspaceInvite:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};