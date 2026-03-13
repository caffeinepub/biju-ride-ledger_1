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
import { type Platform, type Ride, useStore } from "../store/useStore";

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
}

export default function HistoryPage({ onEditRide }: HistoryPageProps) {
  const { rides, settings, formatAmount } = useStore();
  const t = getTranslations(settings.language);

  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterMinFare, setFilterMinFare] = useState("");
  const [filterMaxFare, setFilterMaxFare] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

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
      const rDate = r.datetime.slice(0, 10);
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

  const grouped = useMemo(() => {
    const map = new Map<string, Ride[]>();
    for (const r of filtered) {
      const date = r.datetime.slice(0, 10);
      const arr = map.get(date) || [];
      arr.push(r);
      map.set(date, arr);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={t.history.title} />
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
                      {(
                        [
                          "Uber",
                          "InDrive",
                          "YatriSathi",
                          "Rapido",
                          "Ola",
                          "Porter",
                          "Other",
                        ] as Platform[]
                      ).map((p) => (
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
        {filtered.length === 0 ? (
          <div
            data-ocid="history.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <p className="text-4xl mb-3">🚗</p>
            <p className="text-muted-foreground">{t.history.noRides}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([date, dayRides]) => (
              <div key={date}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <div className="space-y-2">
                  {dayRides.map((ride, idx) => {
                    const globalIdx = filtered.indexOf(ride) + 1;
                    const color = PLATFORM_COLORS[ride.platform];
                    return (
                      <motion.div
                        key={ride.id}
                        data-ocid={`history.ride.item.${globalIdx}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
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
                              {new Date(ride.datetime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="text-right">
                            <p
                              className="text-sm font-bold"
                              style={{ color: "oklch(0.65 0.15 142)" }}
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
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <RideDetailSheet
        ride={selectedRide}
        open={!!selectedRide}
        onClose={() => setSelectedRide(null)}
        onEdit={(r) => onEditRide?.(r)}
      />
    </div>
  );
}
