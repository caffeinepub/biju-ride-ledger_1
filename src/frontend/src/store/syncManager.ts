import { useCallback, useEffect, useRef, useState } from "react";
import { syncToSupabase } from "./supabase";
import type { FuelEntry, OdometerSession, Ride } from "./useStore";

export type SyncStatus = "synced" | "syncing" | "offline";

export function useSyncManager(
  rides: Ride[],
  fuelEntries: FuelEntry[],
  odometerSessions: OdometerSession[],
): { syncStatus: SyncStatus } {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    navigator.onLine ? "synced" : "offline",
  );
  const dataRef = useRef({ rides, fuelEntries, odometerSessions });
  dataRef.current = { rides, fuelEntries, odometerSessions };

  const doSync = useCallback(async () => {
    if (!navigator.onLine) {
      setSyncStatus("offline");
      return;
    }
    setSyncStatus("syncing");
    const { rides: r, fuelEntries: f, odometerSessions: o } = dataRef.current;
    await syncToSupabase(r, f, o);
    setSyncStatus("synced");
  }, []);

  useEffect(() => {
    const timer = setTimeout(doSync, 3000);
    return () => clearTimeout(timer);
  }, [doSync]);

  useEffect(() => {
    const onOnline = () => doSync();
    const onOffline = () => setSyncStatus("offline");
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [doSync]);

  return { syncStatus };
}
