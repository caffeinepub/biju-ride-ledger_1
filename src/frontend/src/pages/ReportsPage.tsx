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
import * as XLSX from "xlsx";
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
  const periodRides = rides.filter((r) => new Date(r.datetime) >= cutoff);
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

/** Build per-day summary rows for export */
function buildExportRows(
  rides: import("../store/useStore").Ride[],
  fuelEntries: import("../store/useStore").FuelEntry[],
  odometerSessions: import("../store/useStore").OdometerSession[],
  days: number,
): Array<(string | number)[]> {
  const header = [
    "Date",
    "Rides",
    "Income (₹)",
    "Fuel (₹)",
    "Run KM",
    "Blank KM",
    "Net Profit (₹)",
  ];
  const rows: Array<(string | number)[]> = [header];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const dayRides = rides.filter((r) => r.datetime.startsWith(dateStr));
    const dayFuel = fuelEntries
      .filter((f) => f.date.startsWith(dateStr))
      .reduce((s, f) => s + f.cost, 0);
    const dayOdo = odometerSessions.find((o) => o.date === dateStr);
    const dayIncome = dayRides.reduce((s, r) => s + r.netIncome, 0);
    const dayRideKm = calcRideKm(dayRides);
    const dayRunKm = dayOdo ? calcRunKm(dayOdo.startKm, dayOdo.endKm) : 0;
    const dayBlankKm = calcBlankKm(dayRunKm, dayRideKm);
    const netProfit = dayIncome - dayFuel;

    rows.push([
      dateStr,
      dayRides.length,
      Number(dayIncome.toFixed(2)),
      Number(dayFuel.toFixed(2)),
      Number(dayRunKm.toFixed(1)),
      Number(dayBlankKm.toFixed(1)),
      Number(netProfit.toFixed(2)),
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
  const [activeTab, setActiveTab] = useState("today");

  // ── Today summary ──
  const todayRides = useMemo(
    () => rides.filter((r) => r.datetime.startsWith(today)),
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
  function getExportDays() {
    if (activeTab === "week") return 7;
    if (activeTab === "month") return 30;
    if (activeTab === "daily") return 1;
    return 1; // today
  }

  function exportCSV() {
    const days = getExportDays();
    const rows = buildExportRows(rides, fuelEntries, odometerSessions, days);
    const csv = rows.map((r) => r.join(",")).join("\n");
    const dateStr = new Date().toISOString().slice(0, 10);
    download(csv, `biju-report-${dateStr}.csv`, "text/csv");
  }

  function exportXLS() {
    const days = getExportDays();
    const rows = buildExportRows(rides, fuelEntries, odometerSessions, days);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `biju-report-${dateStr}.xlsx`);
  }

  function exportPDF() {
    window.print();
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

  function SummaryGrid({
    income,
    ridesCount,
    fuel,
    runKm,
    blankKm,
  }: {
    income: number;
    ridesCount: number;
    fuel: number;
    runKm: number;
    blankKm: number;
  }) {
    return (
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
          value={formatAmount(income - fuel)}
          color="oklch(0.65 0.15 142)"
          bg="oklch(0.65 0.15 142 / 0.15)"
        />
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
                onClick={exportCSV}
              >
                📄 CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                data-ocid="reports.export.xls"
                onClick={exportXLS}
              >
                📊 Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem
                data-ocid="reports.export.pdf"
                onClick={exportPDF}
              >
                🖨️ PDF (Print)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <SummaryGrid
                income={todayIncome}
                ridesCount={todayRides.length}
                fuel={todayFuelCost}
                runKm={todayRunKm}
                blankKm={todayBlankKm}
              />
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
              <SummaryGrid
                income={weekData.income}
                ridesCount={weekData.periodRides.length}
                fuel={weekData.fuel}
                runKm={weekData.runKm}
                blankKm={weekData.blankKm}
              />
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
              <SummaryGrid
                income={monthData.income}
                ridesCount={monthData.periodRides.length}
                fuel={monthData.fuel}
                runKm={monthData.runKm}
                blankKm={monthData.blankKm}
              />
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
                const dRides = rides.filter((r) =>
                  r.datetime.startsWith(dailyDate),
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
                return (
                  <SummaryGrid
                    income={dIncome}
                    ridesCount={dRides.length}
                    fuel={dFuelCost}
                    runKm={dRunKm}
                    blankKm={dBlankKm}
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
                .slice(0, 10)
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
