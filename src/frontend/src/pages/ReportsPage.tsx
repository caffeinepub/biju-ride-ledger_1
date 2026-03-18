import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Download, Lightbulb, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import Header from "../components/Header";
import { getTranslations } from "../i18n";
import {
  getChartData,
  getGoldmineAreas,
  getPeakHours,
  getSmartRecommendations,
} from "../store/analytics";
import { calcBlankKm, calcRideKm, calcRunKm } from "../store/kmUtils";
import { formatISTDate, getISTDateString, useStore } from "../store/useStore";

function calcPeriodData(
  rides: import("../store/useStore").Ride[],
  fuelEntries: import("../store/useStore").FuelEntry[],
  odometerSessions: import("../store/useStore").OdometerSession[],
  days: number,
) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const periodRides = rides.filter(
    (r) => (r.ride_date || r.datetime.slice(0, 10)) >= cutoffStr,
  );
  const periodFuel = fuelEntries.filter((f) => new Date(f.date) >= cutoff);
  const periodOdo = odometerSessions.filter((o) => new Date(o.date) >= cutoff);
  const income = periodRides.reduce((s, r) => s + r.netIncome, 0);
  const fuel = periodFuel.reduce((s, f) => s + f.cost, 0);
  const rideDist = calcRideKm(periodRides);
  const runKm = periodOdo.reduce(
    (s, o) => s + calcRunKm(o.startKm, o.endKm),
    0,
  );
  const blankKm = calcBlankKm(runKm, rideDist);
  return { periodRides, periodFuel, income, fuel, rideDist, runKm, blankKm };
}

/** Best platform and area from rides for display strings */
function getBestPlatformAndArea(rides: import("../store/useStore").Ride[]): {
  bestPlatform?: string;
  bestArea?: string;
} {
  if (rides.length < 2) return {};
  const platformMap: Record<string, { total: number; count: number }> = {};
  const areaMap: Record<string, { total: number; count: number }> = {};
  for (const r of rides) {
    if (!platformMap[r.platform])
      platformMap[r.platform] = { total: 0, count: 0 };
    platformMap[r.platform].total += r.netIncome;
    platformMap[r.platform].count += 1;
    for (const area of [r.pickupArea, r.dropArea]) {
      if (!area) continue;
      if (!areaMap[area]) areaMap[area] = { total: 0, count: 0 };
      areaMap[area].total += r.netIncome;
      areaMap[area].count += 1;
    }
  }
  let bestPlatform: { name: string; avg: number } | null = null;
  for (const [name, { total, count }] of Object.entries(platformMap)) {
    const avg = total / count;
    if (!bestPlatform || avg > bestPlatform.avg) bestPlatform = { name, avg };
  }
  let bestArea: { name: string; avg: number } | null = null;
  for (const [name, { total, count }] of Object.entries(areaMap)) {
    const avg = total / count;
    if (!bestArea || avg > bestArea.avg) bestArea = { name, avg };
  }
  return {
    bestPlatform: bestPlatform
      ? `${bestPlatform.name} · ₹${bestPlatform.avg.toFixed(0)}/ride`
      : undefined,
    bestArea: bestArea
      ? `${bestArea.name} · ₹${bestArea.avg.toFixed(0)}/ride`
      : undefined,
  };
}

/** Build per-day summary rows for export with TOTAL row */
function buildExportRows(
  rides: import("../store/useStore").Ride[],
  fuelEntries: import("../store/useStore").FuelEntry[],
  odometerSessions: import("../store/useStore").OdometerSession[],
  days: number,
): Array<(string | number)[]> {
  const header = [
    "Date",
    "Rides",
    "Ride KM",
    "Run KM",
    "Blank KM",
    "Income (₹)",
    "Fuel (₹)",
    "Tips (₹)",
    "Net Profit (₹)",
  ];
  const dataRows: Array<number[]> = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayRides = rides.filter(
      (r) => (r.ride_date || r.datetime.slice(0, 10)) === dateStr,
    );
    const dayFuel = fuelEntries
      .filter((f) => f.date.startsWith(dateStr))
      .reduce((s, f) => s + f.cost, 0);
    const dayOdo = odometerSessions.find((o) => o.date === dateStr);
    const dayIncome = dayRides.reduce((s, r) => s + r.netIncome, 0);
    const dayRideKm = calcRideKm(dayRides);
    const dayRunKm = dayOdo ? calcRunKm(dayOdo.startKm, dayOdo.endKm) : 0;
    const dayBlankKm = calcBlankKm(dayRunKm, dayRideKm);
    const dayTips = dayRides.reduce((s, r) => s + r.tips, 0);
    const netProfit = dayIncome - dayFuel;
    dataRows.push([
      dayRides.length,
      dayRideKm,
      dayRunKm,
      dayBlankKm,
      dayIncome,
      dayFuel,
      dayTips,
      netProfit,
    ]);
  }

  const totals = dataRows.reduce(
    (acc, row) => row.map((v, i) => (acc[i] || 0) + v),
    [] as number[],
  );

  // Build date strings in same order as dataRows (days-1 down to 0)
  const datestrs: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    datestrs.push(d.toISOString().slice(0, 10));
  }

  const rows: Array<(string | number)[]> = [header];
  for (let idx = 0; idx < datestrs.length; idx++) {
    rows.push([
      datestrs[idx],
      ...dataRows[idx].map((v, j) => Number(v.toFixed(j < 3 ? 1 : 2))),
    ]);
  }
  rows.push([
    "TOTAL",
    ...totals.map((v, j) => Number(v.toFixed(j < 3 ? 1 : 2))),
  ]);

  return rows;
}

/** Build export rows for a specific date range */
function buildExportRowsForRange(
  rides: import("../store/useStore").Ride[],
  fuelEntries: import("../store/useStore").FuelEntry[],
  odometerSessions: import("../store/useStore").OdometerSession[],
  startDate: string,
  endDate: string,
): Array<(string | number)[]> {
  const header = [
    "Date",
    "Rides",
    "Ride KM",
    "Run KM",
    "Blank KM",
    "Income (₹)",
    "Fuel (₹)",
    "Tips (₹)",
    "Net Profit (₹)",
  ];
  const filtered = rides.filter((r) => {
    const rDate = r.ride_date || r.datetime.slice(0, 10);
    return rDate >= startDate && rDate <= endDate;
  });
  const fuelFiltered = fuelEntries.filter(
    (f) => f.date >= startDate && f.date <= endDate,
  );
  const allDates = new Set([
    ...filtered.map((r) => r.ride_date || r.datetime.slice(0, 10)),
    ...fuelFiltered.map((f) => f.date.slice(0, 10)),
    ...odometerSessions
      .filter((o) => o.date >= startDate && o.date <= endDate)
      .map((o) => o.date),
  ]);
  const sortedDates = Array.from(allDates).sort();
  const dataRows: number[][] = [];
  for (const dateStr of sortedDates) {
    const dayRides = filtered.filter(
      (r) => (r.ride_date || r.datetime.slice(0, 10)) === dateStr,
    );
    const dayFuel = fuelFiltered
      .filter((f) => f.date.startsWith(dateStr))
      .reduce((s, f) => s + f.cost, 0);
    const dayOdo = odometerSessions.find((o) => o.date === dateStr);
    const dayIncome = dayRides.reduce((s, r) => s + r.netIncome, 0);
    const dayRideKm = calcRideKm(dayRides);
    const dayRunKm = dayOdo ? calcRunKm(dayOdo.startKm, dayOdo.endKm) : 0;
    const dayBlankKm = calcBlankKm(dayRunKm, dayRideKm);
    const dayTips = dayRides.reduce((s, r) => s + r.tips, 0);
    const netProfit = dayIncome - dayFuel;
    dataRows.push([
      dayRides.length,
      dayRideKm,
      dayRunKm,
      dayBlankKm,
      dayIncome,
      dayFuel,
      dayTips,
      netProfit,
    ]);
  }
  const totals = dataRows.reduce(
    (acc, row) => row.map((v, i) => (acc[i] || 0) + v),
    [] as number[],
  );
  const rows: Array<(string | number)[]> = [header];
  for (let i = 0; i < sortedDates.length; i++) {
    rows.push([
      sortedDates[i],
      ...dataRows[i].map((v, j) => Number(v.toFixed(j < 3 ? 1 : 2))),
    ]);
  }
  if (sortedDates.length > 0) {
    rows.push([
      "TOTAL",
      ...totals.map((v, j) => Number(v.toFixed(j < 3 ? 1 : 2))),
    ]);
  }
  return rows;
}

interface ReportsPageProps {
  onAvatarClick?: () => void;
}

export default function ReportsPage({ onAvatarClick }: ReportsPageProps) {
  const { rides, fuelEntries, odometerSessions, settings, formatAmount } =
    useStore();
  const t = getTranslations(settings.language);
  const sym =
    settings.currency === "INR" ? "₹" : settings.currency === "BDT" ? "৳" : "$";

  const today = getISTDateString();
  const [dailyDate, setDailyDate] = useState(today);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "preparing" | "done"
  >("idle");
  const [lastExportBlob, setLastExportBlob] = useState<{
    content: string;
    filename: string;
    mimeType: string;
  } | null>(null);
  const [selectedExportMonth, setSelectedExportMonth] =
    useState<string>("current");
  const [activeTab, setActiveTab] = useState("today");

  // ── Today summary ──
  const todayRides = useMemo(
    () =>
      rides.filter((r) => (r.ride_date || r.datetime.slice(0, 10)) === today),
    [rides, today],
  );
  const todayFuelCost = useMemo(
    () =>
      fuelEntries
        .filter((f) => f.date.startsWith(today))
        .reduce((s, f) => s + f.cost, 0),
    [fuelEntries, today],
  );
  const todayOdo = odometerSessions.find((s) => s.date === today);
  const todayRunKm = todayOdo ? calcRunKm(todayOdo.startKm, todayOdo.endKm) : 0;
  const todayRideDist = calcRideKm(todayRides);
  const todayBlankKm = calcBlankKm(todayRunKm, todayRideDist);
  const todayIncome = todayRides.reduce((s, r) => s + r.netIncome, 0);

  // ── Period helpers ──
  const weekData = useMemo(
    () => calcPeriodData(rides, fuelEntries, odometerSessions, 7),
    [rides, fuelEntries, odometerSessions],
  );
  const monthData = useMemo(
    () => calcPeriodData(rides, fuelEntries, odometerSessions, 30),
    [rides, fuelEntries, odometerSessions],
  );

  const weekChartData = useMemo(
    () => getChartData(rides, fuelEntries, 7),
    [rides, fuelEntries],
  );
  const monthChartData = useMemo(
    () => getChartData(rides, fuelEntries, 30),
    [rides, fuelEntries],
  );
  const todayChartData = useMemo(
    () => getChartData(rides, fuelEntries, 7),
    [rides, fuelEntries],
  );

  const weekGoldmine = useMemo(
    () => getGoldmineAreas(weekData.periodRides),
    [weekData.periodRides],
  );
  const weekPeakHours = useMemo(
    () => getPeakHours(weekData.periodRides),
    [weekData.periodRides],
  );
  const weekRecs = useMemo(
    () => getSmartRecommendations(weekData.periodRides),
    [weekData.periodRides],
  );

  const monthGoldmine = useMemo(
    () => getGoldmineAreas(monthData.periodRides),
    [monthData.periodRides],
  );
  const monthPeakHours = useMemo(
    () => getPeakHours(monthData.periodRides),
    [monthData.periodRides],
  );
  const monthRecs = useMemo(
    () => getSmartRecommendations(monthData.periodRides),
    [monthData.periodRides],
  );

  const todayGoldmine = useMemo(
    () => getGoldmineAreas(todayRides),
    [todayRides],
  );
  const todayPeakHours = useMemo(() => getPeakHours(todayRides), [todayRides]);
  const todayRecs = useMemo(
    () => getSmartRecommendations(todayRides),
    [todayRides],
  );

  const chartStroke = "oklch(0.58 0.21 264)";
  const chartOrange = "oklch(0.72 0.19 47)";

  // ── Export helpers ──
  function getExportRows() {
    const dateStr = new Date().toISOString().slice(0, 10);
    if (activeTab === "month" && selectedExportMonth !== "current") {
      if (selectedExportMonth === "all") {
        const allDates = rides.map((r) => r.datetime.slice(0, 10)).sort();
        const start = allDates[0] || dateStr;
        return buildExportRowsForRange(
          rides,
          fuelEntries,
          odometerSessions,
          start,
          dateStr,
        );
      }
      // Parse YYYY-MM
      const [yr, mo] = selectedExportMonth.split("-").map(Number);
      const startDate = `${yr}-${String(mo).padStart(2, "0")}-01`;
      const endDate = new Date(yr, mo, 0).toISOString().slice(0, 10);
      return buildExportRowsForRange(
        rides,
        fuelEntries,
        odometerSessions,
        startDate,
        endDate,
      );
    }
    if (activeTab === "week")
      return buildExportRows(rides, fuelEntries, odometerSessions, 7);
    if (activeTab === "month")
      return buildExportRows(rides, fuelEntries, odometerSessions, 30);
    if (activeTab === "daily") {
      return buildExportRowsForRange(
        rides,
        fuelEntries,
        odometerSessions,
        dailyDate,
        dailyDate,
      );
    }
    return buildExportRowsForRange(
      rides,
      fuelEntries,
      odometerSessions,
      today,
      today,
    );
  }

  function getExportFilename(ext: string) {
    const dateStr = new Date().toISOString().slice(0, 10);
    return `biju-report-${dateStr}.${ext}`;
  }

  async function runExport(format: "csv" | "xlsx" | "pdf") {
    setExportStatus("preparing");
    await new Promise((r) => setTimeout(r, 400));
    setExportStatus("preparing");

    if (format === "pdf") {
      window.print();
      setExportStatus("done");
      return;
    }
    const rows = getExportRows();
    let content: string;
    let filename: string;
    let mimeType: string;
    if (format === "csv") {
      content = rows.map((r) => r.join(",")).join("\n");
      filename = getExportFilename("csv");
      mimeType = "text/csv";
    } else {
      content = rows
        .map((r) =>
          r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");
      filename = getExportFilename("xlsx");
      mimeType = "text/csv";
    }
    setLastExportBlob({ content, filename, mimeType });
    download(content, filename, mimeType);
    await new Promise((r) => setTimeout(r, 300));
    setExportStatus("done");
  }

  function download(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleShare() {
    if (!lastExportBlob) return;
    if (navigator.share) {
      const blob = new Blob([lastExportBlob.content], {
        type: lastExportBlob.mimeType,
      });
      const file = new File([blob], lastExportBlob.filename, {
        type: lastExportBlob.mimeType,
      });
      navigator
        .share({ files: [file], title: "Biju's RideBook Report" })
        .catch(() => {});
    } else {
      navigator.clipboard
        ?.writeText(lastExportBlob.content)
        .then(() => {
          toast.success("Report data copied to clipboard");
        })
        .catch(() => toast.info("Sharing not supported on this device"));
    }
  }

  // Generate list of past 6 months for dropdown
  const monthOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [
      { value: "current", label: "Current Month" },
    ];
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
    const now = new Date();
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      opts.push({
        value: val,
        label: `${months[d.getMonth()]} ${d.getFullYear()}`,
      });
    }
    opts.push({ value: "all", label: "All Data" });
    return opts;
  }, []);

  function SummaryGrid({
    income,
    ridesCount,
    fuel,
    runKm,
    blankKm,
    profitPerRide,
    profitPerKm,
    bestPlatform,
    bestArea,
  }: {
    income: number;
    ridesCount: number;
    fuel: number;
    runKm: number;
    blankKm: number;
    profitPerRide?: number;
    profitPerKm?: number;
    bestPlatform?: string;
    bestArea?: string;
  }) {
    const profit = income - fuel;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <SummaryTile
            label="Income"
            value={formatAmount(income)}
            color="oklch(0.72 0.19 47)"
            bg="oklch(0.72 0.19 47 / 0.12)"
          />
          <SummaryTile
            label="Rides"
            value={String(ridesCount)}
            color="oklch(0.58 0.21 264)"
            bg="oklch(0.58 0.21 264 / 0.12)"
          />
          <SummaryTile
            label="Fuel Cost"
            value={formatAmount(fuel)}
            color="oklch(0.62 0.22 27)"
            bg="oklch(0.62 0.22 27 / 0.12)"
          />
          <SummaryTile
            label="Run KM"
            value={`${runKm.toFixed(1)} km`}
            color="oklch(0.65 0.15 142)"
            bg="oklch(0.65 0.15 142 / 0.12)"
          />
          <SummaryTile
            label="Blank KM"
            value={`${blankKm.toFixed(1)} km`}
            color="oklch(0.55 0.12 264)"
            bg="oklch(0.55 0.12 264 / 0.10)"
          />
          <SummaryTile
            label="Net Profit"
            value={formatAmount(profit)}
            color="oklch(0.65 0.15 142)"
            bg="oklch(0.65 0.15 142 / 0.15)"
          />
          {profitPerRide !== undefined && (
            <SummaryTile
              label="Profit/Ride"
              value={formatAmount(profitPerRide)}
              color="oklch(0.72 0.19 47)"
              bg="oklch(0.72 0.19 47 / 0.10)"
            />
          )}
          {profitPerKm !== undefined && (
            <SummaryTile
              label="Profit/KM"
              value={formatAmount(profitPerKm)}
              color="oklch(0.65 0.15 142)"
              bg="oklch(0.65 0.15 142 / 0.10)"
            />
          )}
        </div>
        {(bestPlatform || bestArea) && (
          <div className="flex flex-wrap gap-2">
            {bestPlatform && (
              <div
                className="flex-1 rounded-xl px-3 py-2"
                style={{
                  background: "oklch(0.72 0.19 47 / 0.10)",
                  border: "1px solid oklch(0.72 0.19 47 / 0.2)",
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "oklch(0.72 0.19 47)" }}
                >
                  Best Platform
                </p>
                <p className="text-xs font-bold mt-0.5">{bestPlatform}</p>
              </div>
            )}
            {bestArea && (
              <div
                className="flex-1 rounded-xl px-3 py-2"
                style={{
                  background: "oklch(0.58 0.21 264 / 0.10)",
                  border: "1px solid oklch(0.58 0.21 264 / 0.2)",
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "oklch(0.58 0.21 264)" }}
                >
                  Best Area
                </p>
                <p className="text-xs font-bold mt-0.5">{bestArea}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  function Charts({
    chartData,
  }: { chartData: ReturnType<typeof getChartData> }) {
    return (
      <>
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold text-sm mb-3">
            {t.reports.incomeTrend}
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartStroke} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartStroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border))"
                strokeOpacity={0.5}
              />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: number) => formatAmount(v)}
                contentStyle={{
                  background: "oklch(var(--card))",
                  border: "1px solid oklch(var(--border))",
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke={chartStroke}
                fill="url(#incomeGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold text-sm mb-3">
            {t.reports.fuelTrend}
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border))"
                strokeOpacity={0.5}
              />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: number) => formatAmount(v)}
                contentStyle={{
                  background: "oklch(var(--card))",
                  border: "1px solid oklch(var(--border))",
                }}
              />
              <Bar dataKey="fuel" fill={chartOrange} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold text-sm mb-3">
            {t.reports.rideCounts}
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border))"
                strokeOpacity={0.5}
              />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "oklch(var(--card))",
                  border: "1px solid oklch(var(--border))",
                }}
              />
              <Bar
                dataKey="rideCount"
                fill={chartStroke}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  }

  function AnalyticsSection({
    goldmineAreas,
    peakHours,
    recs,
  }: {
    goldmineAreas: ReturnType<typeof getGoldmineAreas>;
    peakHours: ReturnType<typeof getPeakHours>;
    recs: string[];
  }) {
    return (
      <>
        {goldmineAreas.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} style={{ color: "oklch(0.72 0.19 47)" }} />
              <h3 className="font-display font-semibold text-sm">
                {t.reports.goldmine}
              </h3>
            </div>
            <div className="space-y-2">
              {goldmineAreas.map((area, i) => (
                <div
                  key={area.area}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                      style={{
                        background:
                          i === 0
                            ? "oklch(0.72 0.19 47)"
                            : i === 1
                              ? "oklch(0.58 0.21 264)"
                              : "oklch(0.65 0.15 142)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-bold">{area.area}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      Avg {formatAmount(area.avgIncome)}/ride
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {area.rideCount} rides
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {peakHours.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-primary" />
              <h3 className="font-display font-semibold text-sm">
                {t.reports.peakHours}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {peakHours.map((h, i) => (
                <div
                  key={h.hour}
                  className="rounded-xl px-3 py-2 text-center"
                  style={{
                    background:
                      i === 0
                        ? "oklch(0.58 0.21 264 / 0.2)"
                        : "oklch(var(--muted))",
                  }}
                >
                  <p className="text-sm font-bold">{h.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatAmount(h.avgIncome)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} style={{ color: "oklch(0.75 0.15 75)" }} />
            <h3 className="font-display font-semibold text-sm">
              {t.reports.recommendations}
            </h3>
          </div>
          <div className="space-y-2">
            {recs.length > 0 ? (
              recs.map((rec) => (
                <p key={rec} className="text-sm">
                  {rec}
                </p>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Add more rides to get smart insights.
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  // Fuel history with cost per km
  const fuelHistory = useMemo(() => {
    const sorted = [...fuelEntries].sort((a, b) => a.odometerKm - b.odometerKm);
    return sorted.map((f, i) => {
      const prev = sorted[i - 1];
      const distCovered = prev ? f.odometerKm - prev.odometerKm : 0;
      const costPerKm = distCovered > 0 ? f.cost / distCovered : 0;
      return { ...f, distCovered, costPerKm };
    });
  }, [fuelEntries]);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={t.reports.title} onAvatarClick={onAvatarClick} />
      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Export Button */}
        {/* Export Controls */}
        <div className="space-y-2">
          {/* Monthly selector (only in month tab) */}
          {activeTab === "month" && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="export-month-select"
                className="text-xs text-muted-foreground font-medium whitespace-nowrap"
              >
                Export period:
              </label>
              <select
                id="export-month-select"
                data-ocid="reports.export_month.select"
                value={selectedExportMonth}
                onChange={(e) => setSelectedExportMonth(e.target.value)}
                className="flex-1 h-9 rounded-xl border border-border bg-background px-3 text-sm"
              >
                {monthOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {exportStatus === "idle" && (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-ocid="reports.export.button"
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl"
                  >
                    <Download size={15} />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    data-ocid="reports.export.csv"
                    onClick={() => runExport("csv")}
                  >
                    📄 CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="reports.export.xls"
                    onClick={() => runExport("xlsx")}
                  >
                    📊 Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="reports.export.pdf"
                    onClick={() => runExport("pdf")}
                  >
                    🖨️ PDF (Print)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {exportStatus === "preparing" && (
            <div
              data-ocid="reports.export.loading_state"
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm"
              style={{
                background: "oklch(0.52 0.21 264 / 0.10)",
                color: "oklch(0.42 0.18 264)",
              }}
            >
              <span className="animate-spin text-base">⟳</span>
              Preparing report...
            </div>
          )}

          {exportStatus === "done" && (
            <div className="space-y-2">
              <div
                data-ocid="reports.export.success_state"
                className="text-center text-sm font-semibold py-2 rounded-xl"
                style={{
                  background: "oklch(0.58 0.16 142 / 0.12)",
                  color: "oklch(0.42 0.14 142)",
                }}
              >
                ✓ Download complete
              </div>
              <div className="flex gap-2">
                <Button
                  data-ocid="reports.download_again.button"
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl gap-1"
                  onClick={() => {
                    if (lastExportBlob)
                      download(
                        lastExportBlob.content,
                        lastExportBlob.filename,
                        lastExportBlob.mimeType,
                      );
                  }}
                >
                  <Download size={13} /> Download Again
                </Button>
                <Button
                  data-ocid="reports.share.button"
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={handleShare}
                >
                  📤 Share
                </Button>
                <Button
                  data-ocid="reports.export.secondary_button"
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs"
                  onClick={() => setExportStatus("idle")}
                >
                  New Export
                </Button>
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="today" onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger
              data-ocid="reports.today.tab"
              value="today"
              className="flex-1"
            >
              Today
            </TabsTrigger>
            <TabsTrigger
              data-ocid="reports.week.tab"
              value="week"
              className="flex-1"
            >
              {t.reports.weekly}
            </TabsTrigger>
            <TabsTrigger
              data-ocid="reports.month.tab"
              value="month"
              className="flex-1"
            >
              {t.reports.monthly}
            </TabsTrigger>
            <TabsTrigger
              data-ocid="reports.daily.tab"
              value="daily"
              className="flex-1"
            >
              Daily
            </TabsTrigger>
          </TabsList>

          {/* TODAY TAB */}
          <TabsContent value="today" className="space-y-4 mt-4">
            <div className="rounded-2xl bg-card border border-border p-4">
              <h3 className="font-display font-semibold mb-3">
                Today — {formatISTDate(today)}
              </h3>
              {(() => {
                const todayProfit = todayIncome - todayFuelCost;
                const ppr =
                  todayRides.length > 0 ? todayProfit / todayRides.length : 0;
                const ppk = todayRunKm > 0 ? todayProfit / todayRunKm : 0;
                const { bestPlatform: bp, bestArea: ba } =
                  getBestPlatformAndArea(todayRides);
                return (
                  <SummaryGrid
                    income={todayIncome}
                    ridesCount={todayRides.length}
                    fuel={todayFuelCost}
                    runKm={todayRunKm}
                    blankKm={todayBlankKm}
                    profitPerRide={ppr}
                    profitPerKm={ppk}
                    bestPlatform={bp}
                    bestArea={ba}
                  />
                );
              })()}
            </div>
            <Charts chartData={todayChartData} />
            <AnalyticsSection
              goldmineAreas={todayGoldmine}
              peakHours={todayPeakHours}
              recs={todayRecs}
            />
          </TabsContent>

          {/* WEEKLY TAB */}
          <TabsContent value="week" className="space-y-4 mt-4">
            <div className="rounded-2xl bg-card border border-border p-4">
              <h3 className="font-display font-semibold mb-3">
                {t.reports.summary}
              </h3>
              {(() => {
                const weekProfit = weekData.income - weekData.fuel;
                const ppr =
                  weekData.periodRides.length > 0
                    ? weekProfit / weekData.periodRides.length
                    : 0;
                const ppk =
                  weekData.runKm > 0 ? weekProfit / weekData.runKm : 0;
                const { bestPlatform: bp, bestArea: ba } =
                  getBestPlatformAndArea(weekData.periodRides);
                return (
                  <SummaryGrid
                    income={weekData.income}
                    ridesCount={weekData.periodRides.length}
                    fuel={weekData.fuel}
                    runKm={weekData.runKm}
                    blankKm={weekData.blankKm}
                    profitPerRide={ppr}
                    profitPerKm={ppk}
                    bestPlatform={bp}
                    bestArea={ba}
                  />
                );
              })()}
            </div>
            <Charts chartData={weekChartData} />
            <AnalyticsSection
              goldmineAreas={weekGoldmine}
              peakHours={weekPeakHours}
              recs={weekRecs}
            />
          </TabsContent>

          {/* MONTHLY TAB */}
          <TabsContent value="month" className="space-y-4 mt-4">
            <div className="rounded-2xl bg-card border border-border p-4">
              <h3 className="font-display font-semibold mb-3">
                {t.reports.summary}
              </h3>
              {(() => {
                const monthProfit = monthData.income - monthData.fuel;
                const ppr =
                  monthData.periodRides.length > 0
                    ? monthProfit / monthData.periodRides.length
                    : 0;
                const ppk =
                  monthData.runKm > 0 ? monthProfit / monthData.runKm : 0;
                const { bestPlatform: bp, bestArea: ba } =
                  getBestPlatformAndArea(monthData.periodRides);
                return (
                  <SummaryGrid
                    income={monthData.income}
                    ridesCount={monthData.periodRides.length}
                    fuel={monthData.fuel}
                    runKm={monthData.runKm}
                    blankKm={monthData.blankKm}
                    profitPerRide={ppr}
                    profitPerKm={ppk}
                    bestPlatform={bp}
                    bestArea={ba}
                  />
                );
              })()}
            </div>
            <Charts chartData={monthChartData} />
            <AnalyticsSection
              goldmineAreas={monthGoldmine}
              peakHours={monthPeakHours}
              recs={monthRecs}
            />
          </TabsContent>

          {/* DAILY TAB */}
          <TabsContent value="daily" className="space-y-4 mt-4">
            <div className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-display font-semibold">Daily Report</h3>
              </div>
              <input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm mb-3"
              />
              {(() => {
                const dRides = rides.filter(
                  (r) => (r.ride_date || r.datetime.slice(0, 10)) === dailyDate,
                );
                const dFuel = fuelEntries.filter((f) =>
                  f.date.startsWith(dailyDate),
                );
                const dOdo = odometerSessions.find((o) => o.date === dailyDate);
                const dIncome = dRides.reduce((s, r) => s + r.netIncome, 0);
                const dFuelCost = dFuel.reduce((s, f) => s + f.cost, 0);
                const dRunKm = dOdo ? calcRunKm(dOdo.startKm, dOdo.endKm) : 0;
                const dRideDist = calcRideKm(dRides);
                const dBlankKm = calcBlankKm(dRunKm, dRideDist);
                const dProfit = dIncome - dFuelCost;
                const dPpr = dRides.length > 0 ? dProfit / dRides.length : 0;
                const dPpk = dRunKm > 0 ? dProfit / dRunKm : 0;
                const { bestPlatform: dBp, bestArea: dBa } =
                  getBestPlatformAndArea(dRides);
                return (
                  <SummaryGrid
                    income={dIncome}
                    ridesCount={dRides.length}
                    fuel={dFuelCost}
                    runKm={dRunKm}
                    blankKm={dBlankKm}
                    profitPerRide={dPpr}
                    profitPerKm={dPpk}
                    bestPlatform={dBp}
                    bestArea={dBa}
                  />
                );
              })()}
            </div>
          </TabsContent>
        </Tabs>

        {/* Odometer / Run KM History */}
        {odometerSessions.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-4">
            <h3 className="font-display font-semibold text-sm mb-3">
              Run KM History
            </h3>
            <div className="space-y-2">
              {[...odometerSessions]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((s, i) => (
                  <div
                    key={s.id}
                    data-ocid={`reports.odo.item.${i + 1}`}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatISTDate(s.date)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.startTime || "--"} → {s.endTime || "--"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {calcRunKm(s.startKm, s.endKm).toFixed(1)} km
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.startKm} → {s.endKm}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Fuel History */}
        {fuelHistory.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-4">
            <h3 className="font-display font-semibold text-sm mb-3">
              Fuel History
            </h3>
            <div className="space-y-2">
              {[...fuelHistory]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((f, i) => (
                  <div
                    key={f.id}
                    data-ocid={`reports.fuel.item.${i + 1}`}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatISTDate(f.date)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {f.litres}L · {f.odometerKm} km odo
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {sym}
                        {f.cost.toFixed(2)}
                      </p>
                      {f.distCovered > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {sym}
                          {f.costPerKm.toFixed(2)}/km ·{" "}
                          {f.distCovered.toFixed(0)} km
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-xl p-3" style={{ background: bg }}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
