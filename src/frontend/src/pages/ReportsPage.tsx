import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Lightbulb, Trophy } from "lucide-react";
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
import Header from "../components/Header";
import { getTranslations } from "../i18n";
import {
  getChartData,
  getGoldmineAreas,
  getPeakHours,
  getSmartRecommendations,
} from "../store/analytics";
import { useStore } from "../store/useStore";

export default function ReportsPage() {
  const { rides, fuelEntries, dailyOdometers, settings, formatAmount } =
    useStore();
  const t = getTranslations(settings.language);
  const [period, setPeriod] = useState<"week" | "month">("week");

  const days = period === "week" ? 7 : 30;

  const chartData = useMemo(
    () => getChartData(rides, fuelEntries, days),
    [rides, fuelEntries, days],
  );

  const periodRides = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return rides.filter((r) => new Date(r.datetime) >= cutoff);
  }, [rides, days]);

  const totalIncome = periodRides.reduce((s, r) => s + r.netIncome, 0);
  const totalFuel = fuelEntries
    .filter((f) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return new Date(f.date) >= cutoff;
    })
    .reduce((s, f) => s + f.cost, 0);
  const totalDist = periodRides.reduce((s, r) => s + r.distance, 0);

  const totalDayDist = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return dailyOdometers
      .filter((o) => new Date(o.date) >= cutoff)
      .reduce((s, o) => s + Math.max(0, o.endKm - o.startKm), 0);
  }, [dailyOdometers, days]);

  const blankKm = Math.max(0, totalDayDist - totalDist);

  const goldmineAreas = useMemo(
    () => getGoldmineAreas(periodRides),
    [periodRides],
  );
  const peakHours = useMemo(() => getPeakHours(periodRides), [periodRides]);
  const recs = useMemo(
    () => getSmartRecommendations(periodRides),
    [periodRides],
  );

  const chartStroke = "oklch(0.58 0.21 264)";
  const chartOrange = "oklch(0.72 0.19 47)";

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={t.reports.title} />
      <main className="flex-1 px-4 py-4 space-y-4">
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as "week" | "month")}
        >
          <TabsList className="w-full">
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
          </TabsList>

          <TabsContent value={period} className="space-y-4 mt-4">
            {/* Period Summary */}
            <div className="rounded-2xl bg-card border border-border p-4">
              <h3 className="font-display font-semibold mb-3">
                {t.reports.summary}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-3"
                  style={{ background: "oklch(0.72 0.19 47 / 0.12)" }}
                >
                  <p className="text-xs text-muted-foreground">Income</p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: "oklch(0.72 0.19 47)" }}
                  >
                    {formatAmount(totalIncome)}
                  </p>
                </div>
                <div
                  className="rounded-xl p-3"
                  style={{ background: "oklch(0.58 0.21 264 / 0.12)" }}
                >
                  <p className="text-xs text-muted-foreground">Rides</p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: "oklch(0.58 0.21 264)" }}
                  >
                    {periodRides.length}
                  </p>
                </div>
                <div
                  className="rounded-xl p-3"
                  style={{ background: "oklch(0.62 0.22 27 / 0.12)" }}
                >
                  <p className="text-xs text-muted-foreground">Fuel</p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: "oklch(0.62 0.22 27)" }}
                  >
                    {formatAmount(totalFuel)}
                  </p>
                </div>
                <div
                  className="rounded-xl p-3"
                  style={{ background: "oklch(0.65 0.15 142 / 0.12)" }}
                >
                  <p className="text-xs text-muted-foreground">Blank KM</p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: "oklch(0.65 0.15 142)" }}
                  >
                    {blankKm.toFixed(1)} km
                  </p>
                </div>
              </div>
            </div>

            {/* Income Chart */}
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
                      <stop
                        offset="5%"
                        stopColor={chartStroke}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartStroke}
                        stopOpacity={0}
                      />
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

            {/* Fuel Chart */}
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
                  <Bar
                    dataKey="fuel"
                    fill={chartOrange}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Ride Count Chart */}
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

            {/* Goldmine Areas */}
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
                        <span className="text-sm font-medium">{area.area}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {formatAmount(area.avgIncome)}/ride
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

            {/* Peak Hours */}
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

            {/* Smart Recommendations */}
            <div className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={18} style={{ color: "oklch(0.75 0.15 75)" }} />
                <h3 className="font-display font-semibold text-sm">
                  {t.reports.recommendations}
                </h3>
              </div>
              <div className="space-y-2">
                {recs.map((rec) => (
                  <p key={rec} className="text-sm">
                    {rec}
                  </p>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
