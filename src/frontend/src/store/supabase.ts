// Supabase cloud sync — package pending installation
// When @supabase/supabase-js is added to package.json, replace this stub with the real implementation
import type { FuelEntry, OdometerSession, Ride } from "./useStore";

export const supabase = null;

export async function syncToSupabase(
  _rides: Ride[],
  _fuel: FuelEntry[],
  _odometer: OdometerSession[],
): Promise<void> {
  // Cloud sync disabled until Supabase credentials are provided
  // and @supabase/supabase-js package is installed
}
