import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Filter, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import Header from "../components/Header";
import RideDetailSheet from "../components/RideDetailSheet";
import { getTranslations } from "../i18n";
import { calcBlankKm, calcRideKm, calcRunKm } from "../store/kmUtils";
import {
  PLATFORMS,
  type Platform,
  type Ride,
  formatISTDate,
  useStore,
} from "../store/useStore";

export const PLATFORM_COLORS: Record<Platform, string> = {
  Uber: "#000000",
  InDrive: "#16a34a",
  YatriSathi: "#1a56db",
  Rapido: "#ea580c",
  Ola: "#eab308",
  Porter: "#0891b2",
  Other: "#6b7280",
};

interface HistoryPageProps {
  onEditRide?: (ride: Ride) => void;
  onAvatarClick?: () => void;
}

export default function HistoryPage({
  onEditRide,
  onAvatarClick,
}: HistoryPageProps) {
  const {
    rides,
    odometerSessions,
    settings,
    formatAmount,
    deleteRide,
    offDays,
    personalRuns,
    shifts,
  } = useStore();
  const t = getTranslations(settings.language);

  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterMinFare, setFilterMinFare] = useState("");
  const [filterMaxFare, setFilterMaxFare] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return rides.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.platform.toLowerCase().includes(q) ||
        r.pickupArea.toLowerCase().includes(q) ||
        r.dropArea.toLowerCase().includes(q);
      const matchPlatform =
        filterPlatform === "all" || r.platform === filterPlatform;
      const rDate = r.ride_date || r.datetime.slice(0, 10);
      const matchDateFrom = !filterDateFrom || rDate >= filterDateFrom;
      const matchDateTo = !filterDateTo || rDate <= filterDateTo;
      const matchMinFare =
        !filterMinFare || r.fare >= Number.parseFloat(filterMinFare);
      const matchMaxFare =
        !filterMaxFare || r.fare <= Number.parseFloat(filterMaxFare);
      return (
        matchSearch &&
        matchPlatform &&
        matchDateFrom &&
        matchDateTo &&
        matchMinFare &&
        matchMaxFare
      );
    });
  }, [
    rides,
    search,
    filterPlatform,
    filterDateFrom,
    filterDateTo,
    filterMinFare,
    filterMaxFare,
  ]);

  // ─── Include all dates from all sources, not just those with rides ───
  const grouped = useMemo(() => {
    const dateSet = new Set<string>();
    for (const r of filtered)
      dateSet.add(r.ride_date || r.datetime.slice(0, 10));
    for (const s of odometerSessions) dateSet.add(s.date);
    for (const d of offDays) dateSet.add(d);
    for (const p of personalRuns) dateSet.add(p.date);
    for (const s of shifts) dateSet.add(s.date);

    // apply date-range filter to non-ride dates
    return Array.from(dateSet)
      .filter((date) => {
        if (filterDateFrom && date < filterDateFrom) return false;
        if (filterDateTo && date > filterDateTo) return false;
        return true;
      })
      .sort((a, b) => b.localeCompare(a))
      .map((date) => {
        const dayRides = filtered.filter(
          (r) => (r.ride_date || r.datetime.slice(0, 10)) === date,
        );
        return [date, dayRides] as [string, typeof filtered];
      });
  }, [
    filtered,
    odometerSessions,
    offDays,
    personalRuns,
    shifts,
    filterDateFrom,
    filterDateTo,
  ]);

  const hasAnyData = grouped.length > 0;

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={t.history.title} onAvatarClick={onAvatarClick} />
      <main className="flex-1 px-4 py-4 space-y-3">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              data-ocid="history.search.input"
              placeholder={t.history.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
          <Button
            data-ocid="history.filter.button"
            variant="outline"
            className="h-11 px-3 rounded-xl gap-1.5"
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter size={16} />
            <ChevronDown
              size={14}
              className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </Button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Platform</p>
                  <Select
                    value={filterPlatform}
                    onValueChange={setFilterPlatform}
                  >
                    <SelectTrigger
                      data-ocid="history.platform.select"
                      className="mt-1 h-10"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">From</p>
                    <Input
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="mt-1 h-10 text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">To</p>
                    <Input
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      className="mt-1 h-10 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Min Fare</p>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filterMinFare}
                      onChange={(e) => setFilterMinFare(e.target.value)}
                      className="mt-1 h-10 text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Max Fare</p>
                    <Input
                      type="number"
                      placeholder="9999"
                      value={filterMaxFare}
                      onChange={(e) => setFilterMaxFare(e.target.value)}
                      className="mt-1 h-10 text-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats bar */}
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>{filtered.length} rides</span>
          <span>•</span>
          <span>
            Total: {formatAmount(filtered.reduce((s, r) => s + r.netIncome, 0))}
          </span>
        </div>

        {/* Ride List */}
        {!hasAnyData ? (
          <div
            data-ocid="history.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <p className="text-4xl mb-3">🚗</p>
            <p className="text-muted-foreground">{t.history.noRides}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([date, dayRides], groupIdx) => {
              const dayIncome = dayRides.reduce((s, r) => s + r.netIncome, 0);
              const rideKm = calcRideKm(dayRides);
              const odoSession = odometerSessions.find((s) => s.date === date);
              const shiftForDate = shifts.find((s) => s.date === date);
              const runKm = odoSession
                ? calcRunKm(odoSession.startKm, odoSession.endKm)
                : shiftForDate?.startKm && shiftForDate?.endKm
                  ? calcRunKm(shiftForDate.startKm, shiftForDate.endKm)
                  : null;
              const blankKm =
                runKm !== null ? calcBlankKm(runKm, rideKm) : null;
              const isOffDayDate = offDays.includes(date);
              const personalRunEntry = personalRuns.find(
                (p) => p.date === date,
              );
              const shiftEntry = shifts.find((s) => s.date === date);

              return (
                <div key={date}>
                  {/* Date group header */}
                  <div className="px-3 py-2.5 rounded-xl mb-2 bg-muted/60 dark:bg-muted/40">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-foreground">
                        {formatISTDate(date)}
                      </p>
                      <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {formatAmount(dayIncome)}
                      </p>
                    </div>

                    {/* Status badges */}
                    {(isOffDayDate ||
                      personalRunEntry ||
                      shiftEntry ||
                      odoSession) && (
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {isOffDayDate && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            🛌 Off Day
                          </span>
                        )}
                        {personalRunEntry && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            🚗 Personal Run {personalRunEntry.km}km
                          </span>
                        )}
                        {/* BUG 3 FIX: unified shift KM badge covering both old odometerSessions and new shifts */}
                        {(() => {
                          const startKm =
                            shiftEntry?.startKm ?? odoSession?.startKm;
                          const endKm = shiftEntry?.endKm ?? odoSession?.endKm;
                          const isActive = shiftEntry?.active;
                          if (startKm && endKm && !isActive) {
                            return (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                ✅ Shift KM: {startKm} → {endKm}
                              </span>
                            );
                          }
                          if (isActive && startKm) {
                            return (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                ⚡ Shift Active (Start: {startKm} km)
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}

                    {/* Stats pills */}
                    <div className="flex flex-wrap gap-1.5">
                      <DayStat
                        label="Rides"
                        value={String(dayRides.length)}
                        variant="blue"
                      />
                      <DayStat
                        label="Ride KM"
                        value={`${rideKm.toFixed(1)} km`}
                        variant="green"
                      />
                      <DayStat
                        label="Run KM"
                        value={runKm !== null ? `${runKm.toFixed(1)} km` : "—"}
                        variant="blue"
                      />
                      <DayStat
                        label="Blank KM"
                        value={
                          blankKm !== null ? `${blankKm.toFixed(1)} km` : "—"
                        }
                        variant="orange"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {dayRides.length === 0 && (
                      <div className="py-3 px-3 text-xs text-muted-foreground italic">
                        No rides recorded
                      </div>
                    )}
                    {dayRides.map((ride, idx) => {
                      const itemIdx = groupIdx * 100 + idx + 1;
                      const color = PLATFORM_COLORS[ride.platform];
                      return (
                        <motion.div
                          key={ride.id}
                          data-ocid={`history.ride.item.${itemIdx}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          onClick={() => setSelectedRide(ride)}
                          className="rounded-2xl border border-border bg-card p-3.5 cursor-pointer active:scale-[0.98] transition-transform shadow-xs"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 rounded-full text-white text-xs font-bold"
                                style={{ background: color }}
                              >
                                {ride.platform}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(ride.datetime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                            <div className="text-right">
                              <p
                                className="text-sm font-bold"
                                style={{ color: "oklch(0.42 0.17 142)" }}
                              >
                                {formatAmount(ride.netIncome)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Fare: {formatAmount(ride.fare)}
                              </p>
                            </div>
                          </div>
                          {(ride.pickupArea || ride.dropArea) && (
                            <p className="text-xs text-muted-foreground mt-2 truncate">
                              {ride.pickupArea} → {ride.dropArea}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0"
                            >
                              {ride.distance} km
                            </Badge>
                            {ride.commission > 0 && (
                              <span className="text-xs text-muted-foreground">
                                Comm: {formatAmount(ride.commission)}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              Tips: ₹{(ride.tips ?? 0).toFixed(0)}
                            </span>
                          </div>

                          {/* Theme-adaptive edit/delete buttons */}
                          <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                            <button
                              type="button"
                              data-ocid={`history.ride.edit_button.${itemIdx}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditRide?.(ride);
                              }}
                              className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/60"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              data-ocid={`history.ride.delete_button.${itemIdx}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingDeleteId(ride.id);
                              }}
                              className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <RideDetailSheet
        ride={selectedRide}
        open={!!selectedRide}
        onClose={() => setSelectedRide(null)}
        onEdit={(r) => onEditRide?.(r)}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent data-ocid="history.ride.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ride?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ride? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="history.delete.cancel_button"
              onClick={() => setPendingDeleteId(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="history.delete.confirm_button"
              onClick={() => {
                if (pendingDeleteId) {
                  deleteRide(pendingDeleteId);
                  setPendingDeleteId(null);
                }
              }}
              style={{ background: "oklch(0.52 0.22 27)", color: "white" }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DayStat({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "blue" | "green" | "orange" | "default";
}) {
  const colorClass =
    variant === "blue"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      : variant === "green"
        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        : variant === "orange"
          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
          : "bg-muted text-foreground";
  return (
    <div
      className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${colorClass}`}
    >
      <span className="opacity-70">{label}:</span>
      <span>{value}</span>
    </div>
  );
}
