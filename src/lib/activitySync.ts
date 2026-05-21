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

export async function syncActivityToSupabase(activityId: string) {
  try {
    const key = ACTIVITY_KEYS[activityId];
    if (!key) return { success: false, error: 'Unknown activity' };

    const rawData = localStorage.getItem(key);
    if (!rawData) return { success: false, error: 'No local data found' };

    const data = JSON.parse(rawData);

    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log(`Syncing ${activityId} to Supabase for ${user.email}...`);

    const { data: res, error } = await supabase.functions.invoke('activity-completed', {
      body: {
        email: user.email,
        activity_id: activityId,
        metadata: data,
      },
    });

    if (error) {
      console.error(`Error syncing ${activityId}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`Successfully synced ${activityId}:`, res);
    return { success: true, data: res };
  } catch (err: any) {
    console.error(`Exception syncing ${activityId}:`, err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function syncAllCompletedActivities() {
  const activities = Object.keys(ACTIVITY_KEYS);
  console.log('Starting sync of all completed activities...');
  const results = [];
  for (const act of activities) {
    const key = ACTIVITY_KEYS[act];
    if (localStorage.getItem(key)) {
      const res = await syncActivityToSupabase(act);
      results.push({ activityId: act, ...res });
    }
  }
  return results;
}
