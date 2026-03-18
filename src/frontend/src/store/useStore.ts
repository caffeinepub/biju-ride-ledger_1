import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createElement } from "react";

export type Platform =
  | "Uber"
  | "InDrive"
  | "YatriSathi"
  | "Rapido"
  | "Ola"
  | "Porter"
  | "Other";
export type CommissionType = "percentage" | "fixed" | "daily_fee" | "none";

export const PLATFORMS: Platform[] = [
  "Uber",
  "InDrive",
  "YatriSathi",
  "Rapido",
  "Ola",
  "Porter",
  "Other",
];

export interface Ride {
  id: string;
  ride_id?: string;
  ride_date?: string;
  entry_timestamp?: string;
  platform: Platform;
  fare: number;
  commission: number;
  tips: number;
  distance: number;
  pickupArea: string;
  dropArea: string;
  datetime: string;
  netIncome: number;
  paymentType?: "cash" | "online" | "cash_upi" | "app_online";
}

export interface FuelEntry {
  id: string;
  date: string;
  odometerKm: number;
  litres: number;
  cost: number;
}

export interface OdometerSession {
  id: string;
  date: string;
  startKm: number;
  endKm: number;
  startTime?: string;
  endTime?: string;
}

/** @deprecated use OdometerSession */
export interface DailyOdometer {
  date: string;
  startKm: number;
  endKm: number;
}

export interface PlatformCommission {
  type: CommissionType;
  value: number;
}

export interface Settings {
  driverName: string;
  vehicleType: "Bike" | "Car" | "Auto" | "Toto" | "Other";
  city: string;
  profilePicture: string;
  dailyTarget: number;
  fuelPricePerLitre: number;
  language: "en" | "bn" | "hi";
  currency: "INR" | "BDT" | "USD";
  platformCommissions: Record<Platform, PlatformCommission>;
}

export interface ShiftData {
  date: string;
  active: boolean;
  startTime: string;
  startKm: number;
  endTime?: string;
  endKm?: number;
}

export interface PersonalRun {
  date: string;
  km: number;
}

const defaultSettings: Settings = {
  driverName: "Biju",
  vehicleType: "Bike",
  city: "",
  profilePicture: "",
  dailyTarget: 1000,
  fuelPricePerLitre: 105,
  language: "en",
  currency: "INR",
  platformCommissions: {
    Uber: { type: "daily_fee", value: 10 },
    InDrive: { type: "percentage", value: 10 },
    YatriSathi: { type: "fixed", value: 3 },
    Rapido: { type: "percentage", value: 20 },
    Ola: { type: "percentage", value: 20 },
    Porter: { type: "percentage", value: 10 },
    Other: { type: "none", value: 0 },
  },
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function migrateOdometers(raw: unknown[]): OdometerSession[] {
  return raw.map((item) => {
    const d = item as Record<string, unknown>;
    return {
      id: (d.id as string) || crypto.randomUUID(),
      date: (d.date as string) || "",
      startKm: (d.startKm as number) || 0,
      endKm: (d.endKm as number) || 0,
      startTime: (d.startTime as string) || undefined,
      endTime: (d.endTime as string) || undefined,
    };
  });
}

export function generateRideId(dateStr: string): string {
  return `RIDE_${dateStr.replace(/-/g, "")}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

interface StoreContextType {
  rides: Ride[];
  fuelEntries: FuelEntry[];
  odometerSessions: OdometerSession[];
  /** @deprecated use odometerSessions */
  dailyOdometers: DailyOdometer[];
  settings: Settings;
  /** Computed: today's shift (backward-compat) */
  shiftData: ShiftData | null;
  /** Full shifts array */
  shifts: ShiftData[];
  offDays: string[];
  personalRuns: PersonalRun[];
  addRide: (ride: Omit<Ride, "id">) => void;
  updateRide: (id: string, ride: Omit<Ride, "id">) => void;
  deleteRide: (id: string) => void;
  addFuelEntry: (entry: Omit<FuelEntry, "id">) => void;
  deleteFuelEntry: (id: string) => void;
  setDailyOdometer: (
    date: string,
    startKm: number,
    endKm: number,
    startTime?: string,
    endTime?: string,
  ) => void;
  addOdometerSession: (session: Omit<OdometerSession, "id">) => void;
  updateOdometerSession: (
    id: string,
    session: Partial<Omit<OdometerSession, "id">>,
  ) => void;
  deleteOdometerSession: (id: string) => void;
  updateSettings: (s: Partial<Settings>) => void;
  getCurrencySymbol: () => string;
  formatAmount: (amount: number) => string;
  getTodayRides: () => Ride[];
  getTodayFuelCost: () => number;
  getTodayOdometer: () => OdometerSession | undefined;
  getAreaSuggestions: (partial: string) => string[];
  startShift: (startKm: number, date?: string) => void;
  endShift: (endKm: number, date?: string) => void;
  clearShift: () => void;
  updateShift: (date: string, data: Partial<ShiftData>) => void;
  deleteShift: (date: string) => void;
  addOffDay: (date: string) => void;
  removeOffDay: (date: string) => void;
  addPersonalRun: (date: string, km: number) => void;
  removePersonalRun: (date: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [rides, setRides] = useState<Ride[]>(() =>
    loadFromStorage("biju_rides", []),
  );
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() =>
    loadFromStorage("biju_fuel", []),
  );
  const [odometerSessions, setOdometerSessions] = useState<OdometerSession[]>(
    () => {
      const raw = loadFromStorage<unknown[]>("biju_odometers", []);
      return migrateOdometers(raw);
    },
  );
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = loadFromStorage<Partial<Settings>>("biju_settings", {});
    return {
      ...defaultSettings,
      ...saved,
      platformCommissions: {
        ...defaultSettings.platformCommissions,
        ...(saved.platformCommissions || {}),
      },
    };
  });

  // ─── Shifts array (replaces single shiftData) ───
  const [shifts, setShifts] = useState<ShiftData[]>(() => {
    const arr = loadFromStorage<ShiftData[]>("biju_shifts", []);
    // one-time migration of old single biju_shift
    const old = loadFromStorage<ShiftData | null>("biju_shift", null);
    if (old?.date && !arr.find((s) => s.date === old.date)) {
      return [...arr, old];
    }
    return arr;
  });

  const [offDays, setOffDays] = useState<string[]>(() =>
    loadFromStorage("biju_offdays", []),
  );
  const [personalRuns, setPersonalRuns] = useState<PersonalRun[]>(() =>
    loadFromStorage("biju_personalruns", []),
  );

  // ─── One-time migration: assign ride_id, ride_date, entry_timestamp ───
  useEffect(() => {
    const migrated = localStorage.getItem("biju_migrated_rideid_v1");
    if (migrated) return;
    setRides((prev) => {
      let changed = false;
      const updated = prev.map((r) => {
        if (r.ride_id && r.ride_date && r.entry_timestamp) return r;
        changed = true;
        const rideDate = r.ride_date || r.datetime.slice(0, 10);
        return {
          ...r,
          ride_id: r.ride_id || generateRideId(rideDate),
          ride_date: rideDate,
          entry_timestamp: r.entry_timestamp || r.datetime,
        };
      });
      if (changed) saveToStorage("biju_rides", updated);
      return updated;
    });
    localStorage.setItem("biju_migrated_rideid_v1", "1");
  }, []);

  useEffect(() => {
    saveToStorage("biju_rides", rides);
  }, [rides]);
  useEffect(() => {
    saveToStorage("biju_fuel", fuelEntries);
  }, [fuelEntries]);
  useEffect(() => {
    saveToStorage("biju_odometers", odometerSessions);
  }, [odometerSessions]);
  useEffect(() => {
    saveToStorage("biju_settings", settings);
  }, [settings]);
  useEffect(() => {
    saveToStorage("biju_shifts", shifts);
  }, [shifts]);
  useEffect(() => {
    saveToStorage("biju_offdays", offDays);
  }, [offDays]);
  useEffect(() => {
    saveToStorage("biju_personalruns", personalRuns);
  }, [personalRuns]);

  // Computed backward-compat: today's shift
  const today = getISTDateString();
  const shiftData = shifts.find((s) => s.date === today) ?? null;

  const addRide = useCallback((ride: Omit<Ride, "id">) => {
    const rideDate = ride.ride_date || ride.datetime.slice(0, 10);
    const newRide: Ride = {
      ...ride,
      id: crypto.randomUUID(),
      ride_id: ride.ride_id || generateRideId(rideDate),
      ride_date: rideDate,
      entry_timestamp: ride.entry_timestamp || new Date().toISOString(),
    };
    setRides((prev) => [newRide, ...prev]);
  }, []);

  const updateRide = useCallback((id: string, ride: Omit<Ride, "id">) => {
    setRides((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const rideDate = ride.ride_date || ride.datetime.slice(0, 10);
        return {
          ...ride,
          id,
          ride_id: r.ride_id || generateRideId(rideDate),
          ride_date: rideDate,
          entry_timestamp: r.entry_timestamp || new Date().toISOString(),
        };
      }),
    );
  }, []);

  const deleteRide = useCallback((id: string) => {
    setRides((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addFuelEntry = useCallback((entry: Omit<FuelEntry, "id">) => {
    setFuelEntries((prev) =>
      [...prev, { ...entry, id: crypto.randomUUID() }].sort(
        (a, b) => a.odometerKm - b.odometerKm,
      ),
    );
  }, []);

  const deleteFuelEntry = useCallback((id: string) => {
    setFuelEntries((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const setDailyOdometer = useCallback(
    (
      date: string,
      startKm: number,
      endKm: number,
      startTime?: string,
      endTime?: string,
    ) => {
      setOdometerSessions((prev) => {
        const existing = prev.find((d) => d.date === date);
        if (existing)
          return prev.map((d) =>
            d.date === date
              ? {
                  ...d,
                  date,
                  startKm,
                  endKm,
                  startTime: startTime ?? d.startTime,
                  endTime: endTime ?? d.endTime,
                }
              : d,
          );
        return [
          ...prev,
          { id: crypto.randomUUID(), date, startKm, endKm, startTime, endTime },
        ];
      });
    },
    [],
  );

  const addOdometerSession = useCallback(
    (session: Omit<OdometerSession, "id">) => {
      setOdometerSessions((prev) => [
        ...prev,
        { ...session, id: crypto.randomUUID() },
      ]);
    },
    [],
  );

  const updateOdometerSession = useCallback(
    (id: string, session: Partial<Omit<OdometerSession, "id">>) => {
      setOdometerSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...session } : s)),
      );
    },
    [],
  );

  const deleteOdometerSession = useCallback((id: string) => {
    setOdometerSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSettings = useCallback((s: Partial<Settings>) => {
    setSettings((prev) => ({
      ...prev,
      ...s,
      platformCommissions: {
        ...prev.platformCommissions,
        ...(s.platformCommissions || {}),
      },
    }));
  }, []);

  const getCurrencySymbol = useCallback(() => {
    const symbols: Record<string, string> = { INR: "₹", BDT: "৳", USD: "$" };
    return symbols[settings.currency] || "₹";
  }, [settings.currency]);

  const formatAmount = useCallback(
    (amount: number) => {
      const sym = getCurrencySymbol();
      return `${sym}${amount.toFixed(2)}`;
    },
    [getCurrencySymbol],
  );

  const getTodayRides = useCallback(() => {
    const todayStr = getISTDateString();
    return rides.filter((r) => {
      const rDate = r.ride_date || r.datetime.slice(0, 10);
      return rDate === todayStr;
    });
  }, [rides]);

  const getTodayFuelCost = useCallback(() => {
    const todayStr = getISTDateString();
    return fuelEntries
      .filter((f) => f.date.startsWith(todayStr))
      .reduce((sum, f) => sum + f.cost, 0);
  }, [fuelEntries]);

  const getTodayOdometer = useCallback(() => {
    const todayStr = getISTDateString();
    return odometerSessions.find((d) => d.date === todayStr);
  }, [odometerSessions]);

  const getAreaSuggestions = useCallback(
    (partial: string) => {
      if (!partial.trim()) return [];
      const allAreas = new Set<string>();
      for (const r of rides) {
        if (r.pickupArea) allAreas.add(r.pickupArea);
        if (r.dropArea) allAreas.add(r.dropArea);
      }
      const lp = partial.toLowerCase();
      return Array.from(allAreas)
        .filter((a) => a.toLowerCase().includes(lp))
        .slice(0, 6);
    },
    [rides],
  );

  const startShift = useCallback((startKm: number, date?: string) => {
    const now = new Date().toISOString();
    const shiftDate = date || getISTDateString();
    setShifts((prev) => {
      const existing = prev.find((s) => s.date === shiftDate);
      if (existing) {
        return prev.map((s) =>
          s.date === shiftDate
            ? {
                ...s,
                active: true,
                startTime: now,
                startKm,
                endKm: undefined,
                endTime: undefined,
              }
            : s,
        );
      }
      return [
        ...prev,
        { date: shiftDate, active: true, startTime: now, startKm },
      ];
    });
  }, []);

  const endShift = useCallback((endKm: number, date?: string) => {
    const shiftDate = date || getISTDateString();
    setShifts((prev) =>
      prev.map((s) => {
        if (s.date !== shiftDate) return s;
        const updated = {
          ...s,
          active: false,
          endTime: new Date().toISOString(),
          endKm,
        };
        // sync to odometerSessions
        if (s.startKm && endKm > 0) {
          setOdometerSessions((sessions) => {
            const existing = sessions.find((os) => os.date === shiftDate);
            if (existing) {
              return sessions.map((os) =>
                os.date === shiftDate
                  ? { ...os, startKm: s.startKm!, endKm }
                  : os,
              );
            }
            return [
              ...sessions,
              {
                id: crypto.randomUUID(),
                date: shiftDate,
                startKm: s.startKm!,
                endKm,
              },
            ];
          });
        }
        return updated;
      }),
    );
  }, []);

  // no-op for compat; use deleteShift to clear a specific date's shift
  const clearShift = useCallback(() => {}, []);

  // BUG 1 FIX: synchronously write to storage inside functional updaters
  const updateShift = useCallback((date: string, data: Partial<ShiftData>) => {
    setShifts((prev) => {
      const next = prev.map((s) => (s.date === date ? { ...s, ...data } : s));
      saveToStorage("biju_shifts", next);
      return next;
    });
    if (data.startKm !== undefined || data.endKm !== undefined) {
      setOdometerSessions((prev) => {
        const existing = prev.find((s) => s.date === date);
        if (!existing) return prev;
        const next = prev.map((s) =>
          s.date === date
            ? {
                ...s,
                ...(data.startKm !== undefined
                  ? { startKm: data.startKm }
                  : {}),
                ...(data.endKm !== undefined ? { endKm: data.endKm } : {}),
              }
            : s,
        );
        saveToStorage("biju_odometers", next);
        return next;
      });
    }
  }, []);

  const deleteShift = useCallback((date: string) => {
    setShifts((prev) => {
      const next = prev.filter((s) => s.date !== date);
      saveToStorage("biju_shifts", next);
      return next;
    });
    setOdometerSessions((prev) => {
      const next = prev.filter((s) => s.date !== date);
      saveToStorage("biju_odometers", next);
      return next;
    });
    // Fix: also clear old single-key shift so migration doesn't re-add it on reload
    const oldShift = loadFromStorage<{ date?: string } | null>(
      "biju_shift",
      null,
    );
    if (oldShift?.date === date) {
      localStorage.removeItem("biju_shift");
    }
    // Also remove personalRun and offDay for this date synchronously
    setPersonalRuns((prev) => {
      const next = prev.filter((p) => p.date !== date);
      saveToStorage("biju_personalruns", next);
      return next;
    });
    setOffDays((prev) => {
      const next = prev.filter((d) => d !== date);
      saveToStorage("biju_offdays", next);
      return next;
    });
  }, []);

  const addOffDay = useCallback((date: string) => {
    setOffDays((prev) => (prev.includes(date) ? prev : [...prev, date]));
  }, []);

  const removeOffDay = useCallback((date: string) => {
    setOffDays((prev) => prev.filter((d) => d !== date));
  }, []);

  const addPersonalRun = useCallback((date: string, km: number) => {
    setPersonalRuns((prev) => {
      const filtered = prev.filter((p) => p.date !== date);
      return [...filtered, { date, km }];
    });
  }, []);

  const removePersonalRun = useCallback((date: string) => {
    setPersonalRuns((prev) => prev.filter((p) => p.date !== date));
  }, []);

  const dailyOdometers: DailyOdometer[] = odometerSessions.map((s) => ({
    date: s.date,
    startKm: s.startKm,
    endKm: s.endKm,
  }));

  const value: StoreContextType = {
    rides,
    fuelEntries,
    odometerSessions,
    dailyOdometers,
    settings,
    shiftData,
    shifts,
    offDays,
    personalRuns,
    addRide,
    updateRide,
    deleteRide,
    addFuelEntry,
    deleteFuelEntry,
    setDailyOdometer,
    addOdometerSession,
    updateOdometerSession,
    deleteOdometerSession,
    updateSettings,
    getCurrencySymbol,
    formatAmount,
    getTodayRides,
    getTodayFuelCost,
    getTodayOdometer,
    getAreaSuggestions,
    startShift,
    endShift,
    clearShift,
    updateShift,
    deleteShift,
    addOffDay,
    removeOffDay,
    addPersonalRun,
    removePersonalRun,
  };

  return createElement(StoreContext.Provider, { value }, children);
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function getISTDateString(d?: Date): string {
  const date = d || new Date();
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

export function getISTDatetimeLocal(d?: Date): string {
  const date = d || new Date();
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 16);
}

export function formatISTDate(dateStr: string): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [year, month, day] = dateStr.split("-");
  return `${Number.parseInt(day)} ${months[Number.parseInt(month) - 1]} ${year}`;
}
