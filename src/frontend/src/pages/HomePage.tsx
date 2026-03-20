import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Cloud,
  CloudOff,
  CloudUpload,
  Fuel,
  RefreshCw,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import FuelHistoryModal from "../components/FuelHistoryModal";
import Header from "../components/Header";
import ShiftSummaryModal from "../components/ShiftSummaryModal";
import { getTranslations } from "../i18n";
import { calcBlankKm, calcRideKm, calcRunKm } from "../store/kmUtils";
import { useSyncManager } from "../store/syncManager";
import { formatISTDate, getISTDateString, useStore } from "../store/useStore";

const NOTIFICATION_THRESHOLDS = {
  LOW_EARNINGS_AMOUNT: 300,
  LOW_EARNINGS_HOUR: 18,
  HIGH_FUEL_PCT: 0.3,
  HIGH_BLANK_KM_PCT: 0.3,
  SHIFT_REMINDER_HOURS: 10,
};

interface HomePageProps {
  onAvatarClick?: () => void;
}

function getBestPlatform(rides: import("../store/useStore").Ride[]) {
  if (rides.length < 2) return null;
  const map: Record<string, { total: number; count: number }> = {};
  for (const r of rides) {
    if (!map[r.platform]) map[r.platform] = { total: 0, count: 0 };
    map[r.platform].total += r.netIncome;
    map[r.platform].count += 1;
  }
  let best: { platform: string; avg: number } | null = null;
  for (const [platform, { total, count }] of Object.entries(map)) {
    const avg = total / count;
    if (!best || avg > best.avg) best = { platform, avg };
  }
  return best;
}

function getBestArea(rides: import("../store/useStore").Ride[]) {
  if (rides.length < 2) return null;
  const map: Record<string, { total: number; count: number }> = {};
  for (const r of rides) {
    for (const area of [r.pickupArea, r.dropArea]) {
      if (!area) continue;
      if (!map[area]) map[area] = { total: 0, count: 0 };
      map[area].total += r.netIncome;
      map[area].count += 1;
    }
  }
  let best: { area: string; avg: number } | null = null;
  for (const [area, { total, count }] of Object.entries(map)) {
    const avg = total / count;
    if (!best || avg > best.avg) best = { area, avg };
  }
  return best;
}

function useAnimatedNumber(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    const start = prevRef.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(start + diff * progress);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return display;
}

export default function HomePage({ onAvatarClick }: HomePageProps) {
  const {
    rides,
    fuelEntries,
    odometerSessions,
    settings,
    getTodayRides,
    getTodayFuelCost,
    formatAmount,
    shifts,
    offDays,
    personalRuns,
    startShift,
    endShift,
    updateShift,
    deleteShift,
    addOffDay,
    removeOffDay,
    addPersonalRun,
    removePersonalRun,
    getCurrencySymbol,
  } = useStore();
  const t = getTranslations(settings.language);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [shiftSummaryOpen, setShiftSummaryOpen] = useState(false);
  const [showStartShiftPanel, setShowStartShiftPanel] = useState(false);
  const [showEndShiftPanel, setShowEndShiftPanel] = useState(false);
  const [shiftStartKm, setShiftStartKm] = useState("");
  const [shiftEndKm, setShiftEndKm] = useState("");
  const [personalRunKm, setPersonalRunKm] = useState("");
  const [showPersonalRunPanel, setShowPersonalRunPanel] = useState(false);
  const [showDeleteShiftConfirm, setShowDeleteShiftConfirm] = useState(false);
  const [showEditShiftPanel, setShowEditShiftPanel] = useState(false);
  const [editStartKm, setEditStartKm] = useState("");
  const [editEndKm, setEditEndKm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showKeepGoingPopup, setShowKeepGoingPopup] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  // ─── Selected control date (drives all shift operations) ───
  const [selectedControlDate, setSelectedControlDate] = useState(() =>
    getISTDateString(),
  );
  const today = getISTDateString();
  const sym = getCurrencySymbol();

  const { syncStatus } = useSyncManager(rides, fuelEntries, odometerSessions);

  // BUG 7 FIX: dynamic greeting based on time of day and driver name
  const greeting = (() => {
    const hour = new Date().getHours();
    const timeGreeting =
      hour < 5 || hour >= 21
        ? t.greeting.night
        : hour < 12
          ? t.greeting.morning
          : hour < 17
            ? t.greeting.afternoon
            : t.greeting.evening;
    const name = settings.driverName || "Driver";
    return `${t.greeting.hello} ${name}, ${timeGreeting}`;
  })();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const todayRides = getTodayRides();
  const todayFuelCost = getTodayFuelCost();

  const totalIncome = useMemo(
    () => todayRides.reduce((s, r) => s + r.netIncome, 0),
    [todayRides],
  );
  const netProfit = totalIncome - todayFuelCost;
  const animatedProfit = useAnimatedNumber(netProfit);

  const allTimeIncome = useMemo(
    () => rides.reduce((s, r) => s + r.netIncome, 0),
    [rides],
  );
  const allTimeFuel = useMemo(
    () => fuelEntries.reduce((s, f) => s + f.cost, 0),
    [fuelEntries],
  );
  const allTimeRides = rides.length;
  const allTimeDist = useMemo(
    () => rides.reduce((s, r) => s + r.distance, 0),
    [rides],
  );

  const todayOdoSession = odometerSessions.find((s) => s.date === today);
  const todayRunKm = todayOdoSession
    ? calcRunKm(todayOdoSession.startKm, todayOdoSession.endKm)
    : 0;
  const todayRideKm = useMemo(() => calcRideKm(todayRides), [todayRides]);
  const todayBlankKm = calcBlankKm(todayRunKm, todayRideKm);

  const profitPerRide =
    todayRides.length > 0 ? netProfit / todayRides.length : 0;
  const profitPerKm = todayRunKm > 0 ? netProfit / todayRunKm : 0;
  const deadKm = todayBlankKm;

  const bestPlatform = useMemo(() => getBestPlatform(todayRides), [todayRides]);
  const bestArea = useMemo(() => getBestArea(todayRides), [todayRides]);

  const progressPct =
    settings.dailyTarget > 0
      ? Math.min(100, (totalIncome / settings.dailyTarget) * 100)
      : 0;
  const isGoodDay = totalIncome >= settings.dailyTarget;

  // ─── Weekly Performance ───
  const weeklyData = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const weekRides = rides.filter((r) => new Date(r.datetime) >= monday);
    const weekIncome = weekRides.reduce((s, r) => s + r.netIncome, 0);
    const weekFuel = fuelEntries
      .filter((f) => new Date(f.date) >= monday)
      .reduce((s, f) => s + f.cost, 0);
    const weekProfit = weekIncome - weekFuel;

    const dayMap: Record<string, number> = {};
    for (const r of weekRides) {
      const d = r.datetime.slice(0, 10);
      dayMap[d] = (dayMap[d] || 0) + r.netIncome;
    }
    let bestDay = "";
    let bestDayVal = 0;
    for (const [d, val] of Object.entries(dayMap)) {
      if (val > bestDayVal) {
        bestDayVal = val;
        bestDay = d;
      }
    }
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const bestDayName = bestDay ? dayNames[new Date(bestDay).getDay()] : "—";

    return {
      rides: weekRides.length,
      income: weekIncome,
      profit: weekProfit,
      bestDay: bestDayName,
    };
  }, [rides, fuelEntries]);

  const bestTimeSlot = useMemo(() => {
    const hourBuckets: Record<string, { total: number; count: number }> = {};
    for (const r of rides) {
      const dt = (r as any).ride_time || r.datetime;
      if (!dt) continue;
      try {
        const hour = new Date(dt).getHours();
        const slot =
          hour < 6
            ? "Late Night"
            : hour < 12
              ? "Morning"
              : hour < 17
                ? "Afternoon"
                : hour < 21
                  ? "Evening"
                  : "Night";
        if (!hourBuckets[slot]) hourBuckets[slot] = { total: 0, count: 0 };
        hourBuckets[slot].total += r.netIncome;
        hourBuckets[slot].count++;
      } catch {}
    }
    const entries = Object.entries(hourBuckets);
    if (entries.length === 0) return null;
    const best = entries.sort(
      (a, b) => b[1].total / b[1].count - a[1].total / a[1].count,
    )[0];
    return best ? best[0] : null;
  }, [rides]);

  // ─── Shift state machine for selectedControlDate ───
  const selectedShift = shifts.find((s) => s.date === selectedControlDate);
  const shiftState = !selectedShift
    ? "NOT_STARTED"
    : selectedShift.active
      ? "STARTED"
      : "COMPLETED";
  const isShiftActive = shiftState === "STARTED";
  const isShiftCompleted = shiftState === "COMPLETED";
  const isOffDay = offDays.includes(selectedControlDate);
  const isPersonalRun = personalRuns.find(
    (p) => p.date === selectedControlDate,
  );

  // ─── BUG 2 FIX: selected date data for shift summary popup ───
  const selectedDateRides = useMemo(
    () =>
      rides.filter(
        (r) => (r.ride_date || r.datetime.slice(0, 10)) === selectedControlDate,
      ),
    [rides, selectedControlDate],
  );
  const selectedDateOdoSession = odometerSessions.find(
    (s) => s.date === selectedControlDate,
  );
  const selectedDateShift = shifts.find((s) => s.date === selectedControlDate);
  const selectedDateRunKm = selectedDateOdoSession
    ? calcRunKm(selectedDateOdoSession.startKm, selectedDateOdoSession.endKm)
    : selectedDateShift?.startKm && selectedDateShift?.endKm
      ? calcRunKm(selectedDateShift.startKm, selectedDateShift.endKm)
      : 0;
  const selectedDateRideKm = useMemo(
    () => calcRideKm(selectedDateRides),
    [selectedDateRides],
  );
  const selectedDateIncome = useMemo(
    () => selectedDateRides.reduce((s, r) => s + r.netIncome, 0),
    [selectedDateRides],
  );
  const selectedDateFuelCost = useMemo(
    () =>
      fuelEntries
        .filter((f) => f.date.startsWith(selectedControlDate))
        .reduce((s, f) => s + f.cost, 0),
    [fuelEntries, selectedControlDate],
  );
  const selectedDateBlankKm = calcBlankKm(
    selectedDateRunKm,
    selectedDateRideKm,
  );
  const selectedDateNetProfit = selectedDateIncome - selectedDateFuelCost;

  const handleStartShift = () => {
    const km = Number.parseFloat(shiftStartKm) || 0;
    if (km <= 0) {
      toast.error("Enter start odometer KM");
      return;
    }
    startShift(km, selectedControlDate);
    setShowStartShiftPanel(false);
    setShiftStartKm("");
    toast.success(t.shift.shiftStarted, {
      style: {
        background: "oklch(0.20 0.04 75)",
        color: "oklch(0.98 0.05 80)",
        border: "1px solid oklch(0.55 0.15 75 / 0.6)",
        textShadow: "0 0 8px rgba(255,255,180,0.6)",
      },
    });
  };

  const handleEndShift = () => {
    const km = Number.parseFloat(shiftEndKm) || 0;
    if (km <= 0) {
      toast.error("Enter end odometer KM");
      return;
    }
    endShift(km, selectedControlDate);
    setShowEndShiftPanel(false);
    setShiftEndKm("");
    setShiftSummaryOpen(true);
  };

  const handlePersonalRun = () => {
    const km = Number.parseFloat(personalRunKm) || 0;
    if (km <= 0) {
      toast.error("Enter kilometers driven");
      return;
    }
    addPersonalRun(selectedControlDate, km);
    setShowPersonalRunPanel(false);
    setPersonalRunKm("");
    toast.success(t.shift.shiftUpdated);
  };

  const handleUpdateShift = () => {
    const startKm = Number.parseFloat(editStartKm) || 0;
    const endKm = Number.parseFloat(editEndKm) || 0;
    if (startKm <= 0 || endKm <= 0) {
      toast.error("Enter valid KM values");
      return;
    }
    if (endKm <= startKm) {
      toast.error("End KM must be greater than Start KM");
      return;
    }
    updateShift(selectedControlDate, { startKm, endKm });
    setShowEditShiftPanel(false);
    // BUG 6 FIX: reset edit fields after save
    setEditStartKm("");
    setEditEndKm("");
    toast.success(t.shift.shiftUpdated);
  };

  const handleSyncClick = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  // BUG 2 FIX: shiftSummaryData now uses selectedControlDate data
  const shiftSummaryData = useMemo(() => {
    const tips = selectedDateRides.reduce((s, r) => s + r.tips, 0);
    return {
      rides: selectedDateRides.length,
      rideKm: selectedDateRideKm,
      runKm: selectedDateRunKm,
      income: selectedDateIncome,
      fuelCost: selectedDateFuelCost,
      deadKm: selectedDateBlankKm,
      tips,
      netProfit: selectedDateNetProfit,
      date: formatISTDate(selectedControlDate),
    };
  }, [
    selectedDateRides,
    selectedDateRideKm,
    selectedDateRunKm,
    selectedDateIncome,
    selectedDateFuelCost,
    selectedDateBlankKm,
    selectedDateNetProfit,
    selectedControlDate,
  ]);

  useEffect(() => {
    const notif = localStorage.getItem("biju_notifications") !== "false";
    if (!notif) return;
    const now = new Date();
    const hour = now.getHours();
    const todayKey = now.toISOString().split("T")[0];
    if (
      hour >= NOTIFICATION_THRESHOLDS.LOW_EARNINGS_HOUR &&
      totalIncome < NOTIFICATION_THRESHOLDS.LOW_EARNINGS_AMOUNT
    ) {
      const key = `biju_notif_low_earnings_${todayKey}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        toast.warning(
          `Low earnings today: ₹${totalIncome.toFixed(0)} — consider a few more rides!`,
        );
      }
    }
    if (
      todayRunKm > 0 &&
      todayBlankKm / todayRunKm > NOTIFICATION_THRESHOLDS.HIGH_BLANK_KM_PCT
    ) {
      const key = `biju_notif_blank_km_${todayKey}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        toast.warning(
          `High blank KM: ${todayBlankKm.toFixed(1)} km empty (${Math.round((todayBlankKm / todayRunKm) * 100)}% of run KM)`,
        );
      }
    }
    if (
      totalIncome > 0 &&
      todayFuelCost / totalIncome > NOTIFICATION_THRESHOLDS.HIGH_FUEL_PCT
    ) {
      const key = `biju_notif_fuel_${todayKey}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        toast.warning(
          `High fuel cost: ₹${todayFuelCost.toFixed(0)} is ${Math.round((todayFuelCost / totalIncome) * 100)}% of today income`,
        );
      }
    }
  }, [totalIncome, todayRunKm, todayBlankKm, todayFuelCost]);

  useEffect(() => {
    const notif = localStorage.getItem("biju_notifications") !== "false";
    if (!notif) return;
    try {
      const shiftsRaw = JSON.parse(localStorage.getItem("biju_shifts") || "[]");
      const todayStr = new Date().toISOString().split("T")[0];
      const todayShift = shiftsRaw.find(
        (s: any) => s.date === todayStr && s.active === true,
      );
      if (todayShift?.startTime) {
        const hrs =
          (Date.now() - new Date(todayShift.startTime).getTime()) / 3600000;
        if (hrs >= NOTIFICATION_THRESHOLDS.SHIFT_REMINDER_HOURS) {
          const key = `biju_notif_shift_${todayStr}`;
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            toast.warning(
              "You have been driving for 10+ hours. Consider ending your shift and resting!",
            );
          }
        }
      }
    } catch {}
  }, []);

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.38, delay, ease: "easeOut" as const },
  });

  const periodLabel = `${t.reports.today} — ${formatISTDate(today)}`;

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={t.home.title} onAvatarClick={onAvatarClick} />
      <main className="flex-1 px-4 pt-4 pb-6 space-y-3">
        {/* ─── BUG 7 FIX: Dynamic Greeting ─── */}
        <motion.div {...fadeUp(0)} className="pt-1 pb-0.5">
          <p
            className="text-base font-bold"
            style={{ color: isDark ? "#EAF2FF" : "oklch(0.35 0.12 264)" }}
          >
            {greeting}
          </p>
        </motion.div>

        {/* ─── Cloud Sync Badge ─── */}
        <motion.div
          {...fadeUp(0.01)}
          className="flex items-center justify-between"
        >
          <p
            className="text-sm font-semibold"
            style={{ color: isDark ? "#AFC8FF" : "oklch(0.45 0.10 264)" }}
          >
            {periodLabel}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-ocid="home.sync.button"
              onClick={handleSyncClick}
              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all duration-300 ${
                isSyncing ? "animate-pulse" : ""
              }`}
              style={{
                background:
                  isSyncing || syncStatus === "syncing"
                    ? "#22C55E"
                    : syncStatus === "synced"
                      ? isDark
                        ? "#22C55E"
                        : "oklch(0.58 0.16 142 / 0.15)"
                      : syncStatus === "offline"
                        ? "oklch(0.72 0.18 75 / 0.20)"
                        : "oklch(0.58 0.16 142 / 0.15)",
                color:
                  isSyncing || syncStatus === "syncing"
                    ? "white"
                    : syncStatus === "synced"
                      ? isDark
                        ? "white"
                        : "oklch(0.45 0.21 145)"
                      : syncStatus === "offline"
                        ? "oklch(0.50 0.16 75)"
                        : "oklch(0.45 0.21 145)",
                boxShadow:
                  isSyncing || syncStatus === "synced"
                    ? "0 0 8px rgba(34, 197, 94, 0.5)"
                    : "none",
              }}
            >
              {isSyncing || syncStatus === "syncing" ? (
                <RefreshCw size={10} className="animate-spin" />
              ) : syncStatus === "synced" ? (
                <Cloud size={10} />
              ) : (
                <CloudOff size={10} />
              )}
              {isSyncing
                ? t.home.syncing
                : syncStatus === "synced"
                  ? t.home.synced
                  : syncStatus === "syncing"
                    ? t.home.syncing
                    : t.home.offline}
            </button>
            <button
              type="button"
              data-ocid="home.keep_going.button"
              onClick={() => setShowKeepGoingPopup(true)}
              className="text-xs font-bold px-3 py-1 rounded-full text-white transition-transform active:scale-95"
              style={{
                background: isGoodDay
                  ? "oklch(0.48 0.16 142)"
                  : "oklch(0.60 0.14 75)",
                boxShadow: isGoodDay
                  ? "0 2px 8px oklch(0.48 0.16 142 / 0.4)"
                  : "0 2px 8px oklch(0.60 0.14 75 / 0.4)",
              }}
            >
              {isGoodDay ? t.home.goodDay : t.home.keepGoing}
            </button>
          </div>
        </motion.div>

        {/* ─── Shift Control ─── */}
        <motion.div
          {...fadeUp(0.02)}
          className="rounded-2xl p-3 border bg-card"
          style={{ borderColor: "oklch(var(--border))" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            {t.shift.control}
          </p>

          {/* Date picker — drives all shift operations */}
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {t.shift.shiftDate}
            </p>
            <Input
              data-ocid="shift.date.input"
              type="date"
              value={selectedControlDate}
              max={today}
              onChange={(e) => {
                setSelectedControlDate(e.target.value);
                setShowStartShiftPanel(false);
                setShowEndShiftPanel(false);
                setShowPersonalRunPanel(false);
                setShowEditShiftPanel(false);
              }}
              className="h-10 rounded-xl"
            />
          </div>

          {/* Status badges */}
          {isOffDay && (
            <div
              className="mb-2 px-3 py-1.5 rounded-xl text-sm font-semibold text-center"
              style={{
                background: "oklch(0.55 0.02 264 / 0.15)",
                color: "oklch(0.40 0.02 264)",
              }}
            >
              {`🛌 ${t.shift.offDay}`}
            </div>
          )}
          {isPersonalRun && (
            <div
              className="mb-2 px-3 py-1.5 rounded-xl text-sm font-semibold text-center"
              style={{
                background: "oklch(0.52 0.21 264 / 0.15)",
                color: "oklch(0.38 0.18 264)",
              }}
            >
              {`🚗 ${t.shift.personalRun} — ${isPersonalRun.km} km`}
            </div>
          )}

          {/* Shift active indicator */}
          {isShiftActive && (
            <div className="mb-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/60 border border-yellow-400 dark:border-yellow-500 text-yellow-900 dark:text-yellow-100 shadow-[0_0_12px_rgba(234,179,8,0.4)] dark:[text-shadow:0_0_8px_rgba(255,255,180,0.7)]">
              {t.shift.activeSince}{" "}
              {new Date(selectedShift!.startTime).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              data-ocid="shift.start_button"
              className="flex-1 h-11 rounded-xl font-semibold text-white text-sm gap-1.5"
              disabled={isShiftActive || isShiftCompleted || isOffDay}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.20 142) 0%, oklch(0.52 0.18 142) 100%)",
                opacity:
                  isShiftActive || isShiftCompleted || isOffDay ? 0.5 : 1,
              }}
              onClick={() => {
                setShowStartShiftPanel(true);
                setShowEndShiftPanel(false);
              }}
            >
              {t.shift.startShift}
            </Button>
            <Button
              data-ocid="shift.end_button"
              className="flex-1 h-11 rounded-xl font-semibold text-white text-sm gap-1.5"
              disabled={!isShiftActive}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.48 0.18 27) 0%, oklch(0.55 0.20 27) 100%)",
                opacity: !isShiftActive ? 0.5 : 1,
              }}
              onClick={() => {
                setShowEndShiftPanel(true);
                setShowStartShiftPanel(false);
              }}
            >
              {t.shift.endShift}
            </Button>
          </div>

          {/* Start shift panel — only needs KM (date already selected above) */}
          {showStartShiftPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 space-y-2"
            >
              <p className="text-xs font-medium text-muted-foreground">
                {t.home.startOdometerKM}
              </p>
              <Input
                data-ocid="shift.start_km.input"
                type="number"
                placeholder="e.g. 39740"
                value={shiftStartKm}
                onChange={(e) => setShiftStartKm(e.target.value)}
                className="h-11 rounded-xl"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 rounded-xl text-sm"
                  onClick={() => setShowStartShiftPanel(false)}
                >
                  {t.home.cancelBtn}
                </Button>
                <Button
                  data-ocid="shift.confirm_start.button"
                  className="flex-1 h-10 rounded-xl text-sm text-white"
                  style={{ background: "oklch(0.45 0.20 142)" }}
                  onClick={handleStartShift}
                >
                  {t.home.confirmStart}
                </Button>
              </div>
            </motion.div>
          )}

          {/* End shift panel */}
          {showEndShiftPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 space-y-2"
            >
              <p className="text-xs font-medium text-muted-foreground">
                {t.home.currentOdometerKM}
              </p>
              <Input
                data-ocid="shift.end_km.input"
                type="number"
                placeholder="e.g. 39912"
                value={shiftEndKm}
                onChange={(e) => setShiftEndKm(e.target.value)}
                className="h-11 rounded-xl"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 rounded-xl text-sm"
                  onClick={() => setShowEndShiftPanel(false)}
                >
                  {t.home.cancelBtn}
                </Button>
                <Button
                  data-ocid="shift.confirm_end.button"
                  className="flex-1 h-10 rounded-xl text-sm text-white"
                  style={{ background: "oklch(0.48 0.18 27)" }}
                  onClick={handleEndShift}
                >
                  {t.home.confirmEnd}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Completed shift: show summary + edit/delete */}
          {isShiftCompleted && selectedShift && (
            <div
              className="mt-2 rounded-xl border p-3 space-y-2"
              style={{
                background: "oklch(0.52 0.21 264 / 0.06)",
                borderColor: "oklch(0.52 0.21 264 / 0.20)",
              }}
            >
              <p
                className="text-xs font-semibold"
                style={{ color: "oklch(0.42 0.15 264)" }}
              >
                {t.home.shiftCompleted}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>
                  {t.home.startKM} <strong>{selectedShift.startKm}</strong>
                </span>
                <span>
                  {t.home.endKM} <strong>{selectedShift.endKm ?? "—"}</strong>
                </span>
              </div>
              {showEditShiftPanel ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Start KM"
                    value={editStartKm}
                    onChange={(e) => setEditStartKm(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                  <Input
                    type="number"
                    placeholder="End KM"
                    value={editEndKm}
                    onChange={(e) => setEditEndKm(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-9 rounded-xl text-xs"
                      onClick={() => {
                        setShowEditShiftPanel(false);
                        setEditStartKm("");
                        setEditEndKm("");
                      }}
                    >
                      {t.home.cancelBtn}
                    </Button>
                    <Button
                      data-ocid="shift.save_edit.button"
                      className="flex-1 h-9 rounded-xl text-xs text-white"
                      style={{ background: "oklch(0.45 0.20 142)" }}
                      onClick={handleUpdateShift}
                    >
                      {t.home.saveBtn}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    data-ocid="shift.edit_button"
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 rounded-lg text-xs"
                    onClick={() => {
                      // BUG 6 FIX: pre-populate edit fields with current values
                      setEditStartKm(String(selectedShift.startKm));
                      setEditEndKm(String(selectedShift.endKm ?? ""));
                      setShowEditShiftPanel(true);
                    }}
                  >
                    {t.home.editShift}
                  </Button>
                  <Button
                    data-ocid="shift.delete_button"
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 rounded-lg text-xs"
                    style={{ color: "oklch(0.58 0.22 30)" }}
                    onClick={() => setShowDeleteShiftConfirm(true)}
                  >
                    {t.home.deleteShift}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* View summary button — show when shift is completed */}
          {isShiftCompleted && (
            <Button
              data-ocid="shift.view_summary.button"
              variant="outline"
              className="w-full h-10 rounded-xl text-sm mt-2 font-semibold"
              style={{
                borderColor: "oklch(0.52 0.21 264 / 0.4)",
                color: "oklch(0.46 0.22 255)",
              }}
              onClick={() => setShiftSummaryOpen(true)}
            >
              {t.home.viewSummary}
            </Button>
          )}

          {/* Off Day / Personal Run */}
          <div className="flex gap-2 mt-2">
            <Button
              data-ocid="shift.mark_offday.button"
              variant="outline"
              size="sm"
              className="flex-1 h-9 rounded-xl text-xs"
              onClick={() =>
                isOffDay
                  ? removeOffDay(selectedControlDate)
                  : addOffDay(selectedControlDate)
              }
            >
              {isOffDay ? t.shift.unmarkOffDay : t.shift.markOffDay}
            </Button>
            <Button
              data-ocid="shift.personal_run.button"
              variant="outline"
              size="sm"
              className="flex-1 h-9 rounded-xl text-xs"
              onClick={() => {
                if (isPersonalRun) {
                  removePersonalRun(selectedControlDate);
                } else {
                  // Auto-calculate Personal Run KM = End KM - Start KM if shift has both values
                  if (selectedShift?.endKm && selectedShift?.startKm) {
                    const autoKm = selectedShift.endKm - selectedShift.startKm;
                    if (autoKm > 0) {
                      setPersonalRunKm(String(autoKm));
                    }
                  }
                  setShowPersonalRunPanel(!showPersonalRunPanel);
                }
              }}
            >
              {isPersonalRun
                ? t.shift.clearPersonalRun
                : t.shift.markPersonalRun}
            </Button>
          </div>

          {showPersonalRunPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 space-y-2"
            >
              <div className="space-y-1">
                <Input
                  data-ocid="shift.personal_run_km.input"
                  type="number"
                  placeholder="KM driven personally"
                  value={personalRunKm}
                  onChange={(e) => setPersonalRunKm(e.target.value)}
                  className="h-10 rounded-xl"
                />
                {selectedShift?.endKm && selectedShift?.startKm && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {t.home.autoCalcHint}
                  </p>
                )}
              </div>
              <Button
                data-ocid="shift.personal_run_save.button"
                className="w-full h-9 rounded-xl text-xs text-white"
                style={{ background: "oklch(0.52 0.21 264)" }}
                onClick={handlePersonalRun}
              >
                {t.home.saveBtn}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* ─── Shift Active Banner ─── */}
        {isShiftActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="shift.active.panel"
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/60 border border-yellow-400 dark:border-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.4)]"
          >
            <span style={{ fontSize: 16 }}>⚡</span>
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 dark:[text-shadow:0_0_8px_rgba(255,255,180,0.7)]">
              {t.shift.stillActive}
            </p>
          </motion.div>
        )}

        {/* ─── HERO: Net Profit Card ─── */}
        <motion.div
          {...fadeUp(0.04)}
          className="relative overflow-hidden rounded-2xl px-5 py-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.28 0.14 264) 0%, oklch(0.20 0.10 264) 55%, oklch(0.22 0.10 47) 100%)",
            boxShadow:
              "0 8px 32px -6px oklch(0.22 0.12 264 / 0.7), inset 0 1px 0 oklch(1 0 0 / 0.08)",
          }}
        >
          <div
            className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, oklch(0.72 0.19 47) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-6 -left-4 w-28 h-28 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, oklch(0.68 0.20 264) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "oklch(0.82 0.08 264)" }}
            >
              {t.home.netProfit}
            </p>
            <p className="text-4xl font-bold font-display text-white leading-none mb-3">
              {sym}
              {animatedProfit.toFixed(2)}
            </p>
            <div className="flex gap-2 flex-wrap">
              <StatPill
                label={t.home.totalIncome}
                value={formatAmount(totalIncome)}
                accent="oklch(0.72 0.19 47)"
              />
              <StatPill
                label={t.home.totalRides}
                value={String(todayRides.length)}
                accent="oklch(0.75 0.16 264)"
              />
              <StatPill
                label={t.home.fuelCost}
                value={formatAmount(todayFuelCost)}
                accent="oklch(0.62 0.18 27)"
              />
              <StatPill
                label={t.history.rideKM}
                value={`${todayRideKm.toFixed(1)} km`}
                accent="oklch(0.55 0.16 142)"
              />
            </div>
          </div>
        </motion.div>

        {/* ─── Profit Analyzer ─── */}
        <motion.div
          {...fadeUp(0.06)}
          data-ocid="dashboard.profit_analyzer.card"
          className="rounded-2xl p-4 border"
          style={{
            background: "oklch(0.52 0.21 264 / 0.06)",
            borderColor: "oklch(0.52 0.21 264 / 0.20)",
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: isDark ? "#F1F5F9" : "oklch(0.42 0.15 264)" }}
          >
            {t.shift.profitAnalyzer}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <ProfitTile
              label={t.home.todayProfit}
              value={formatAmount(netProfit)}
              color="oklch(0.62 0.22 50)"
              bg="oklch(0.72 0.19 47 / 0.10)"
            />
            <ProfitTile
              label={t.home.profitPerRide}
              value={formatAmount(profitPerRide)}
              color="oklch(0.46 0.22 255)"
              bg="oklch(0.52 0.21 264 / 0.10)"
            />
            <ProfitTile
              label={t.home.profitPerKM}
              value={formatAmount(profitPerKm)}
              color="oklch(0.45 0.21 145)"
              bg="oklch(0.58 0.16 142 / 0.10)"
            />
            <ProfitTile
              label={t.home.deadKM}
              value={`${deadKm.toFixed(1)} km`}
              color="oklch(0.50 0.18 27)"
              bg="oklch(0.62 0.22 27 / 0.08)"
            />
          </div>
        </motion.div>

        {/* ─── Best Platform & Area ─── */}
        <motion.div {...fadeUp(0.07)} className="grid grid-cols-2 gap-3">
          <div
            data-ocid="dashboard.best_platform.card"
            className="rounded-2xl p-3 border"
            style={{
              background: "oklch(0.72 0.19 47 / 0.07)",
              borderColor: "oklch(0.72 0.19 47 / 0.22)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Star
                size={12}
                style={{ color: "oklch(0.62 0.22 50)" }}
                fill="oklch(0.62 0.22 50)"
              />
              <p
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "oklch(0.62 0.22 50)" }}
              >
                {t.shift.bestPlatform}
              </p>
            </div>
            {bestPlatform ? (
              <>
                <p className="text-sm font-bold leading-tight">
                  {bestPlatform.platform}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t.home.avg} {formatAmount(bestPlatform.avg)}/ride
                </p>
              </>
            ) : (
              <p className="text-[10px] text-muted-foreground leading-snug">
                {t.home.needMoreRides}
              </p>
            )}
          </div>
          <div
            data-ocid="dashboard.best_area.card"
            className="rounded-2xl p-3 border"
            style={{
              background: "oklch(0.52 0.21 264 / 0.07)",
              borderColor: "oklch(0.52 0.21 264 / 0.22)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Star
                size={12}
                style={{ color: "oklch(0.42 0.22 255)" }}
                fill="oklch(0.46 0.22 255)"
              />
              <p
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "oklch(0.42 0.22 255)" }}
              >
                {t.shift.bestArea}
              </p>
            </div>
            {bestArea ? (
              <>
                <p className="text-sm font-bold leading-tight">
                  {bestArea.area}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t.home.avg} {formatAmount(bestArea.avg)}/ride
                </p>
              </>
            ) : (
              <p className="text-[10px] text-muted-foreground leading-snug">
                {t.home.needMoreRides}
              </p>
            )}
          </div>
        </motion.div>

        {/* ─── Weekly Performance ─── */}
        <motion.div
          {...fadeUp(0.08)}
          data-ocid="dashboard.weekly.card"
          className="rounded-2xl p-4 border bg-card"
          style={{ borderColor: "oklch(var(--border))" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            {t.shift.thisWeek}
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">
                {t.home.weekRides}
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.42 0.22 255)" }}
              >
                {weeklyData.rides}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">
                {t.home.weekIncome}
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.45 0.21 145)" }}
              >
                {sym}
                {weeklyData.income.toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">
                {t.home.weekProfit}
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.45 0.21 145)" }}
              >
                {sym}
                {weeklyData.profit.toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">
                {t.home.weekBestDay}
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.62 0.22 50)" }}
              >
                {weeklyData.bestDay}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── All-Time Totals ─── */}
        <motion.div
          {...fadeUp(0.1)}
          className="rounded-2xl p-4 border"
          style={{
            background: "oklch(0.58 0.16 142 / 0.06)",
            borderColor: "oklch(0.58 0.16 142 / 0.20)",
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: isDark ? "#F1F5F9" : "oklch(0.45 0.20 145)" }}
          >
            {t.shift.allTimeTotals}
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">
                {t.home.allTimeRides}
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.42 0.22 255)" }}
              >
                {allTimeRides}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">
                {t.home.allTimeIncome}
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.45 0.21 145)" }}
              >
                {formatAmount(allTimeIncome)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">
                {t.home.allTimeFuel}
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.50 0.18 27)" }}
              >
                {formatAmount(allTimeFuel)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">
                {t.home.allTimeRideKM}
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.42 0.22 255)" }}
              >
                {allTimeDist.toFixed(0)}km
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── Daily Target + Progress ─── */}
        <motion.div
          {...fadeUp(0.14)}
          className="rounded-2xl p-4 border bg-card"
          style={{ borderColor: "oklch(var(--border))" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.52 0.21 264 / 0.12)" }}
              >
                <Target size={15} style={{ color: "oklch(0.49 0.22 255)" }} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.home.dailyTarget}
                </p>
                <p className="text-sm font-bold leading-none">
                  {formatAmount(settings.dailyTarget)}
                </p>
              </div>
            </div>
            <span
              className="text-sm font-bold"
              style={{
                color: isGoodDay
                  ? "oklch(0.45 0.21 145)"
                  : "oklch(0.46 0.22 255)",
              }}
            >
              {progressPct.toFixed(0)}%
            </span>
          </div>
          <Progress value={progressPct} className="h-2.5 rounded-full" />
          <p className="text-[10px] text-muted-foreground text-right mt-1">
            {formatAmount(totalIncome)} / {formatAmount(settings.dailyTarget)}
          </p>
        </motion.div>

        {/* ─── Add Fuel Button ─── */}
        <motion.div {...fadeUp(0.2)}>
          <Button
            data-ocid="home.addfuel.button"
            className="w-full h-12 rounded-xl text-base font-semibold gap-2 text-white transition-all active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.52 0.16 47) 0%, oklch(0.62 0.18 47) 100%)",
              boxShadow: "0 4px 16px -3px oklch(0.62 0.18 47 / 0.40)",
            }}
            onClick={() => setFuelModalOpen(true)}
          >
            <Fuel size={18} />
            {t.home.fuelLog}
          </Button>
        </motion.div>

        {/* ─── Smart Tips (short, dashboard-only) ─── */}
        <motion.div
          {...fadeUp(0.24)}
          className="rounded-2xl p-4 border bg-card"
          style={{ borderColor: "oklch(var(--border))" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.52 0.21 264 / 0.12)" }}
            >
              <Zap size={14} style={{ color: "oklch(0.49 0.22 255)" }} />
            </div>
            <h3 className="font-semibold text-sm font-display">
              {t.home.insights}
            </h3>
          </div>
          {rides.length < 5 ? (
            <p className="text-sm text-muted-foreground">
              {t.home.moreRidesNeeded}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {t.home.dashboardTips.map((tip) => (
                <span
                  key={tip}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "oklch(0.52 0.21 264 / 0.10)",
                    color: isDark ? "#EAF2FF" : "oklch(0.38 0.16 264)",
                    border: "1px solid oklch(0.52 0.21 264 / 0.20)",
                  }}
                >
                  💡 {tip}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* ─── Driver Comparison Insight ─── */}
        {rides.length >= 5 &&
          (() => {
            const totalNetAll = rides.reduce((s, r) => s + r.netIncome, 0);
            const totalDistAll = rides.reduce((s, r) => s + r.distance, 0);
            const allTimeProfitPerKm =
              totalDistAll > 0 ? totalNetAll / totalDistAll : 0;
            return (
              <motion.div
                {...fadeUp(0.28)}
                className="rounded-2xl p-4 border bg-card"
                style={{
                  borderColor: "oklch(0.58 0.21 264 / 0.4)",
                  background: "oklch(0.58 0.21 264 / 0.04)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "oklch(0.52 0.21 264 / 0.12)" }}
                  >
                    <TrendingUp
                      size={14}
                      style={{ color: "oklch(0.49 0.22 255)" }}
                    />
                  </div>
                  <h3 className="font-semibold text-sm font-display">
                    {t.shift.driverComparison}
                  </h3>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {t.home.yourProfitPerKM}
                    </p>
                    <p
                      className="text-2xl font-bold font-display"
                      style={{ color: "oklch(0.42 0.17 142)" }}
                    >
                      {sym}
                      {allTimeProfitPerKm.toFixed(1)}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        / km
                      </span>
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {t.shift.cityAvgSoon}
                </p>
              </motion.div>
            );
          })()}
      </main>

      {/* Keep Going Popup */}
      {showKeepGoingPopup && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowKeepGoingPopup(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowKeepGoingPopup(false)}
          tabIndex={-1}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-card border border-border p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            data-ocid="home.keep_going.modal"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">{t.home.dailyProgress}</h3>
              <button
                type="button"
                data-ocid="home.keep_going.close_button"
                onClick={() => setShowKeepGoingPopup(false)}
                className="text-muted-foreground hover:text-foreground w-7 h-7 rounded-full flex items-center justify-center"
              >
                &times;
              </button>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{t.home.progressLabel}</span>
                <span>{progressPct.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPct}%`,
                    background:
                      progressPct >= 100
                        ? "oklch(0.48 0.16 142)"
                        : "oklch(0.60 0.14 75)",
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {sym}
                  {totalIncome.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.home.earnedToday}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p
                  className="text-xl font-bold"
                  style={{
                    color:
                      Math.max(0, (settings.dailyTarget || 0) - totalIncome) > 0
                        ? "oklch(0.62 0.22 50)"
                        : "oklch(0.48 0.16 142)",
                  }}
                >
                  {Math.max(0, (settings.dailyTarget || 0) - totalIncome) > 0
                    ? `${sym}${Math.max(0, (settings.dailyTarget || 0) - totalIncome).toFixed(0)}`
                    : t.home.done}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.max(0, (settings.dailyTarget || 0) - totalIncome) > 0
                    ? t.home.remaining
                    : t.home.targetAchieved}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center col-span-2">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {sym}
                  {(settings.dailyTarget || 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.home.dailyTarget}
                </p>
              </div>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.21 264 / 0.08), oklch(0.72 0.19 47 / 0.08))",
              }}
            >
              <p className="text-sm font-medium">
                {progressPct >= 100
                  ? t.home.motivational[4]
                  : progressPct >= 75
                    ? t.home.motivational[3]
                    : progressPct >= 50
                      ? t.home.motivational[2]
                      : progressPct >= 25
                        ? t.home.motivational[1]
                        : t.home.motivational[0]}
              </p>
            </div>
            {bestTimeSlot && (
              <div className="text-xs text-muted-foreground text-center">
                {t.home.bestEarningTime}:{" "}
                <span className="font-semibold text-foreground">
                  {bestTimeSlot}
                </span>
              </div>
            )}
            {bestArea && (
              <div className="text-xs text-muted-foreground text-center">
                {t.home.bestArea}:{" "}
                <span className="font-semibold text-foreground">
                  {bestArea.area}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Shift Confirmation Dialog */}
      {showDeleteShiftConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {t.home.deleteShiftConfirm}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.home.deleteShiftDesc}
            </p>
            <div className="flex gap-3">
              <Button
                data-ocid="shift.delete_confirm.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteShiftConfirm(false)}
              >
                {t.home.cancelBtn}
              </Button>
              <Button
                data-ocid="shift.delete_confirm.confirm_button"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  deleteShift(selectedControlDate);
                  setShowDeleteShiftConfirm(false);
                  setShowEditShiftPanel(false);
                  setShowStartShiftPanel(false);
                  setShowEndShiftPanel(false);
                  setEditStartKm("");
                  setEditEndKm("");
                  toast.success(t.shift.shiftUpdated);
                }}
              >
                {t.home.deleteBtn}
              </Button>
            </div>
          </div>
        </div>
      )}
      <FuelHistoryModal
        open={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
      />
      <ShiftSummaryModal
        open={shiftSummaryOpen}
        onClose={() => setShiftSummaryOpen(false)}
        summary={shiftSummaryData}
        currencySymbol={sym}
      />
    </div>
  );
}

function StatPill({
  label,
  value,
  accent,
}: { label: string; value: string; accent: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
      style={{ background: `${accent} / 0.18` }}
    >
      <span className="text-[10px] font-medium opacity-80 text-white">
        {label}:
      </span>
      <span className="text-xs font-bold text-white">{value}</span>
    </div>
  );
}

function ProfitTile({
  label,
  value,
  color,
  bg,
}: { label: string; value: string; color: string; bg: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: bg }}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-lg font-bold font-display" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
