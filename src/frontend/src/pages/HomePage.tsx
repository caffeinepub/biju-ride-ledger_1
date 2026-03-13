import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fuel, Save, Target, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import FuelHistoryModal from "../components/FuelHistoryModal";
import Header from "../components/Header";
import { getTranslations } from "../i18n";
import { getSmartRecommendations } from "../store/analytics";
import { calcBlankKm, calcRideKm, calcRunKm } from "../store/kmUtils";
import { formatISTDate, getISTDateString, useStore } from "../store/useStore";

interface HomePageProps {
  onAvatarClick?: () => void;
}

export default function HomePage({ onAvatarClick }: HomePageProps) {
  const {
    rides,
    fuelEntries,
    odometerSessions,
    settings,
    getTodayRides,
    getTodayFuelCost,
    setDailyOdometer,
    formatAmount,
  } = useStore();
  const t = getTranslations(settings.language);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);

  const today = getISTDateString();

  // ─── Odometer date selector (supports backdating) ───
  const [odoDate, setOdoDate] = useState(today);
  const selectedSession = odometerSessions.find((s) => s.date === odoDate);
  const [startKm, setStartKm] = useState(
    String(selectedSession?.startKm || ""),
  );
  const [endKm, setEndKm] = useState(String(selectedSession?.endKm || ""));

  // When odoDate changes, load that day's session values
  useEffect(() => {
    const session = odometerSessions.find((s) => s.date === odoDate);
    setStartKm(String(session?.startKm || ""));
    setEndKm(String(session?.endKm || ""));
  }, [odoDate, odometerSessions]);

  const todayRides = getTodayRides();
  const todayFuelCost = getTodayFuelCost();

  const totalIncome = useMemo(
    () => todayRides.reduce((s, r) => s + r.netIncome, 0),
    [todayRides],
  );
  const totalRideDistance = useMemo(
    () => todayRides.reduce((s, r) => s + r.distance, 0),
    [todayRides],
  );
  const netProfit = totalIncome - todayFuelCost;

  // ─── All-time cumulative totals ───
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

  const startKmNum = Number.parseFloat(startKm) || 0;
  const endKmNum = Number.parseFloat(endKm) || 0;
  const dayDistance = calcRunKm(startKmNum, endKmNum);

  // Blank km for selected odo date using consistent formula
  const selectedDateRideKm = useMemo(() => {
    return calcRideKm(rides.filter((r) => r.datetime.startsWith(odoDate)));
  }, [rides, odoDate]);
  const blankKm = calcBlankKm(dayDistance, selectedDateRideKm);

  const progressPct =
    settings.dailyTarget > 0
      ? Math.min(100, (netProfit / settings.dailyTarget) * 100)
      : 0;
  const isGoodDay = netProfit >= settings.dailyTarget;

  const recommendations = useMemo(
    () => getSmartRecommendations(rides),
    [rides],
  );

  const handleOdometerSave = () => {
    if (startKmNum > 0) {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5);
      setDailyOdometer(odoDate, startKmNum, endKmNum, timeStr);
      toast.success("Saved successfully");
    } else {
      toast.error("Please enter a Start KM value first");
    }
  };

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.38, delay, ease: "easeOut" as const },
  });

  const periodLabel = `Today — ${formatISTDate(today)}`;

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={t.home.title} onAvatarClick={onAvatarClick} />
      <main className="flex-1 px-4 pt-4 pb-6 space-y-3">
        {/* ─── Period Label ─── */}
        <motion.div
          {...fadeUp(0)}
          className="flex items-center justify-between"
        >
          <p
            className="text-sm font-semibold"
            style={{ color: "oklch(0.65 0.10 264)" }}
          >
            {periodLabel}
          </p>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full text-white"
            style={{
              background: isGoodDay
                ? "oklch(0.58 0.16 142)"
                : "oklch(0.68 0.14 75)",
              boxShadow: isGoodDay
                ? "0 2px 8px oklch(0.58 0.16 142 / 0.4)"
                : "0 2px 8px oklch(0.68 0.14 75 / 0.4)",
            }}
          >
            {isGoodDay ? "Good Day 🎉" : "Keep Going 💪"}
          </span>
        </motion.div>

        {/* ─── HERO: Net Profit Card ─── */}
        <motion.div
          {...fadeUp(0.04)}
          className="relative overflow-hidden rounded-2xl px-5 py-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.30 0.14 264) 0%, oklch(0.22 0.10 264) 55%, oklch(0.24 0.10 47) 100%)",
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
              className="text-[11px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: "oklch(0.85 0.08 264)" }}
            >
              {t.home.netProfit}
            </p>
            <p className="text-4xl font-bold font-display text-white leading-none mb-3">
              {formatAmount(netProfit)}
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
                accent="oklch(0.72 0.18 27)"
              />
            </div>
          </div>
        </motion.div>

        {/* ─── All-Time Totals ─── */}
        <motion.div
          {...fadeUp(0.06)}
          className="rounded-2xl p-4 border"
          style={{
            background: "oklch(0.65 0.15 142 / 0.08)",
            borderColor: "oklch(0.65 0.15 142 / 0.25)",
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: "oklch(0.58 0.12 142)" }}
          >
            All Time Totals
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Rides</p>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.58 0.21 264)" }}
              >
                {allTimeRides}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Income</p>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.65 0.15 142)" }}
              >
                {formatAmount(allTimeIncome)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Fuel</p>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.62 0.22 27)" }}
              >
                {formatAmount(allTimeFuel)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Dist</p>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.72 0.18 264)" }}
              >
                {allTimeDist.toFixed(0)}km
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── Distance Card ─── */}
        <motion.div
          {...fadeUp(0.08)}
          className="rounded-2xl px-4 py-4 border"
          style={{
            background: "oklch(0.58 0.21 264 / 0.10)",
            borderColor: "oklch(0.58 0.21 264 / 0.25)",
            boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.05)",
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: "oklch(0.65 0.10 264)" }}
          >
            {t.home.totalDistance}
          </p>
          <p
            className="text-2xl font-bold font-display"
            style={{ color: "oklch(0.78 0.18 264)" }}
          >
            {totalRideDistance.toFixed(1)}
            <span className="text-base font-medium ml-1 opacity-70">km</span>
          </p>
        </motion.div>

        {/* ─── Daily Target ─── */}
        <motion.div
          {...fadeUp(0.12)}
          className="rounded-2xl p-4 border bg-card"
          style={{
            borderColor: "oklch(var(--border))",
            boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.04)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.58 0.21 264 / 0.15)" }}
              >
                <Target size={15} style={{ color: "oklch(0.72 0.18 264)" }} />
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
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t.home.progress}</span>
              <span className="font-semibold">{progressPct.toFixed(0)}%</span>
            </div>
            <div
              className="h-2.5 rounded-full overflow-hidden"
              style={{ background: "oklch(var(--muted))" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: isGoodDay
                    ? "linear-gradient(90deg, oklch(0.55 0.18 142), oklch(0.65 0.18 142))"
                    : "linear-gradient(90deg, oklch(0.58 0.21 264), oklch(0.72 0.19 47))",
                  boxShadow: isGoodDay
                    ? "0 0 8px oklch(0.60 0.18 142 / 0.6)"
                    : "0 0 8px oklch(0.65 0.20 264 / 0.6)",
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* ─── Odometer Section ─── */}
        <motion.div
          {...fadeUp(0.16)}
          className="rounded-2xl p-4 border bg-card"
          style={{ borderColor: "oklch(var(--border))" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} style={{ color: "oklch(0.72 0.19 47)" }} />
              <h3 className="font-semibold text-sm font-display">Odometer</h3>
            </div>
          </div>

          {/* Date selector for backdating */}
          <div className="mb-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Date
            </p>
            <Input
              data-ocid="home.ododate.input"
              type="date"
              value={odoDate}
              onChange={(e) => setOdoDate(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                {t.home.startKm}
              </p>
              <Input
                data-ocid="home.startodometer.input"
                type="number"
                placeholder="e.g. 12000"
                value={startKm}
                onChange={(e) => setStartKm(e.target.value)}
                onBlur={handleOdometerSave}
                className="h-11"
              />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                {t.home.endKm}
              </p>
              <Input
                data-ocid="home.endodometer.input"
                type="number"
                placeholder="e.g. 12085"
                value={endKm}
                onChange={(e) => setEndKm(e.target.value)}
                onBlur={handleOdometerSave}
                className="h-11"
              />
            </div>
          </div>

          {/* Save Odometer Button */}
          <Button
            data-ocid="home.save_odometer.button"
            onClick={handleOdometerSave}
            className="w-full h-11 rounded-xl font-semibold gap-2 text-white mb-3 transition-all active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.20 264) 0%, oklch(0.55 0.22 264) 100%)",
              boxShadow: "0 4px 14px -3px oklch(0.55 0.22 264 / 0.45)",
            }}
          >
            <Save size={16} />
            Save Odometer
          </Button>

          <div
            className="flex gap-0 rounded-xl overflow-hidden border"
            style={{ borderColor: "oklch(var(--border))" }}
          >
            <div className="flex-1 px-3 py-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {t.home.dayDistance}
              </p>
              <p className="text-base font-bold">{dayDistance.toFixed(1)} km</p>
            </div>
            <div
              className="w-px"
              style={{ background: "oklch(var(--border))" }}
            />
            <div className="flex-1 px-3 py-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {t.home.blankKm}
              </p>
              <p
                className="text-base font-bold"
                style={{ color: "oklch(0.62 0.22 27)" }}
              >
                {blankKm.toFixed(1)} km
              </p>
            </div>
          </div>

          {odoDate !== today && (
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Viewing: {formatISTDate(odoDate)}
            </p>
          )}
        </motion.div>

        {/* ─── Add Fuel / View Fuel Log Button ─── */}
        <motion.div {...fadeUp(0.2)}>
          <Button
            data-ocid="home.addfuel.button"
            className="w-full h-12 rounded-xl text-base font-semibold gap-2 text-white transition-all active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.62 0.17 47) 0%, oklch(0.72 0.19 47) 100%)",
              boxShadow: "0 4px 16px -3px oklch(0.72 0.19 47 / 0.45)",
            }}
            onClick={() => setFuelModalOpen(true)}
          >
            <Fuel size={18} />
            Fuel Log
          </Button>
        </motion.div>

        {/* ─── Smart Insights ─── */}
        {recommendations.length > 0 && (
          <motion.div
            {...fadeUp(0.24)}
            className="rounded-2xl p-4 border bg-card"
            style={{ borderColor: "oklch(var(--border))" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.58 0.21 264 / 0.15)" }}
              >
                <Zap size={14} style={{ color: "oklch(0.78 0.18 264)" }} />
              </div>
              <h3 className="font-semibold text-sm font-display">
                {t.home.insights}
              </h3>
            </div>
            <div className="space-y-2.5">
              {recommendations.map((rec) => (
                <div
                  key={rec}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <span
                    className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                    style={{ background: "oklch(0.72 0.19 47)" }}
                  />
                  {rec}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
      <FuelHistoryModal
        open={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
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
      style={{ background: "oklch(1 0 0 / 0.09)" }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: accent }}
      />
      <span className="text-[10px] text-white/60">{label}</span>
      <span className="text-[11px] font-bold text-white">{value}</span>
    </div>
  );
}
