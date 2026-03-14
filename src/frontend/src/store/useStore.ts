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
  platform: Platform;
  fare: number;
  commission: number;
  tips: number;
  distance: number;
  pickupArea: string;
  dropArea: string;
  datetime: string;
  netIncome: number;
  paymentType?: "cash" | "online";
}

export interface FuelEntry {
  id: string;
  date: string;
  odometerKm: number;
  litres: number;
  cost: number;
}

// Enhanced odometer session with datetime support
export interface OdometerSession {
  id: string;
  date: string; // YYYY-MM-DD
  startKm: number;
  endKm: number;
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
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
  vehicleType: "Bike" | "Car" | "Auto" | "Other";
  city: string;
  profilePicture: string;
  dailyTarget: number;
  fuelPricePerLitre: number;
  language: "en" | "bn" | "hi";
  currency: "INR" | "BDT" | "USD";
  platformCommissions: Record<Platform, PlatformCommission>;
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

/** Migrate old DailyOdometer[] to OdometerSession[] */
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

interface StoreContextType {
  rides: Ride[];
  fuelEntries: FuelEntry[];
  odometerSessions: OdometerSession[];
  /** @deprecated use odometerSessions */
  dailyOdometers: DailyOdometer[];
  settings: Settings;
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

  const addRide = useCallback((ride: Omit<Ride, "id">) => {
    setRides((prev) => [{ ...ride, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const updateRide = useCallback((id: string, ride: Omit<Ride, "id">) => {
    setRides((prev) => prev.map((r) => (r.id === id ? { ...ride, id } : r)));
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
    const today = getISTDateString();
    return rides.filter((r) => r.datetime.startsWith(today));
  }, [rides]);

  const getTodayFuelCost = useCallback(() => {
    const today = getISTDateString();
    const todayFuel = fuelEntries.filter((f) => f.date.startsWith(today));
    return todayFuel.reduce((sum, f) => sum + f.cost, 0);
  }, [fuelEntries]);

  const getTodayOdometer = useCallback(() => {
    const today = getISTDateString();
    return odometerSessions.find((d) => d.date === today);
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

  // Backward-compat dailyOdometers view
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
  };

  return createElement(StoreContext.Provider, { value }, children);
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

/** Get current date string in IST (YYYY-MM-DD) */
export function getISTDateString(d?: Date): string {
  const date = d || new Date();
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

/** Get current datetime string in IST for input[type=datetime-local] */
export function getISTDatetimeLocal(d?: Date): string {
  const date = d || new Date();
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 16);
}

/** Format IST date for display: "11 Mar 2026" */
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
