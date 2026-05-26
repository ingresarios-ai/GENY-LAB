import { supabase } from './supabase';

const ACTIVITY_KEYS: Record<string, string> = {
  adn: 'adn-diagnosis',
  gastos: 'gastos-hormiga-progress',
  termostato: 'termostato-diagnosis',
  trampas: 'trampas-dinero-progress',
  pedem: 'pedem-progress',
  sombra: 'reto-sombra-progress',
  flow: 'reto-flow-progress',
};

export async function saveActivityProgressDB(activityId: string, data: any, isCompleted: boolean = false) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return { success: false, error: 'User not authenticated' };

    const { data: res, error } = await supabase.functions.invoke('activity-completed', {
      body: {
        email: user.email,
        activity_id: activityId,
        metadata: data,
        is_completed: isCompleted,
      },
    });

    if (error) throw error;
    return { success: true, data: res };
  } catch (err: any) {
    console.error(`Error saving ${activityId} to DB:`, err);
    return { success: false, error: err.message };
  }
}

export async function loadActivityProgressDB(activityId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return null;

    const { data: enrolledUser } = await supabase
      .from('enrolled_users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!enrolledUser) return null;

    const { data, error } = await supabase
      .from('user_activity_log')
      .select('metadata, completed_at')
      .eq('user_id', enrolledUser.id)
      .eq('activity_id', activityId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected for new activities
      console.error(`Error loading ${activityId} from DB:`, error);
      return null;
    }

    if (data) {
      return { metadata: data.metadata, completed: !!data.completed_at };
    }
    return null;
  } catch (err) {
    console.error(`Exception loading ${activityId}:`, err);
    return null;
  }
}

export async function clearActivityProgressDB(activityId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return;

    const { data: enrolledUser } = await supabase
      .from('enrolled_users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!enrolledUser) return;

    await supabase
      .from('user_activity_log')
      .delete()
      .eq('user_id', enrolledUser.id)
      .eq('activity_id', activityId);
  } catch (err) {
    console.error(`Exception clearing ${activityId}:`, err);
  }
}

export async function syncActivityToSupabase(activityId: string) {
  // Legacy function for backwards compatibility
  return { success: true };
}

export async function syncAllCompletedActivities() {
  // Legacy function for backwards compatibility
  return [];
}

export async function loadAllActivitiesProgressDB() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return [];

    const { data: enrolledUser } = await supabase
      .from('enrolled_users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!enrolledUser) return [];

    const { data, error } = await supabase
      .from('user_activity_log')
      .select('activity_id, metadata, completed_at')
      .eq('user_id', enrolledUser.id);

    if (error) {
      console.error('Error loading all activities progress:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Exception loading all activities progress:', err);
    return [];
  }
}
