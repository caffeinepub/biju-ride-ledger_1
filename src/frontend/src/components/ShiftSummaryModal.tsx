import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "../i18n";
import { useStore } from "../store/useStore";

interface ShiftSummary {
  rides: number;
  rideKm: number;
  runKm: number;
  income: number;
  fuelCost: number;
  deadKm: number;
  tips: number;
  netProfit: number;
  date: string;
}

interface ShiftSummaryModalProps {
  open: boolean;
  onClose: () => void;
  summary: ShiftSummary;
  currencySymbol?: string;
}

function fmt(sym: string, val: number) {
  return `${sym}${val.toFixed(2)}`;
}

export default function ShiftSummaryModal({
  open,
  onClose,
  summary,
  currencySymbol = "₹",
}: ShiftSummaryModalProps) {
  const { settings } = useStore();
  const t = getTranslations(settings.language);
  const ts = t.shift_summary;
  const sym = currencySymbol;

  const rows: { label: string; value: string; highlight?: boolean }[] = [
    { label: ts.totalRides, value: String(summary.rides) },
    { label: ts.rideKM, value: `${summary.rideKm.toFixed(1)} km` },
    { label: ts.runKM, value: `${summary.runKm.toFixed(1)} km` },
    { label: ts.deadKM, value: `${summary.deadKm.toFixed(1)} km` },
    { label: ts.totalIncome, value: fmt(sym, summary.income) },
    { label: ts.fuelCost, value: fmt(sym, summary.fuelCost) },
    { label: ts.tips, value: fmt(sym, summary.tips) },
    {
      label: ts.netProfit,
      value: fmt(sym, summary.netProfit),
      highlight: true,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="shift_summary.dialog"
        className="rounded-2xl max-w-sm mx-auto"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 justify-center mb-1">
            <CheckCircle2 size={22} style={{ color: "oklch(0.58 0.16 142)" }} />
            <DialogTitle className="text-lg font-bold font-display">
              {ts.title}
            </DialogTitle>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {summary.date}
          </p>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {rows.map(({ label, value, highlight }) => (
            <div
              key={label}
              className="flex items-center justify-between px-3 py-2 rounded-xl"
              style={{
                background: highlight
                  ? "oklch(0.58 0.16 142 / 0.12)"
                  : "oklch(var(--muted))",
              }}
            >
              <span className="text-sm text-muted-foreground">{label}</span>
              <span
                className="text-sm font-bold"
                style={{
                  color: highlight ? "oklch(0.48 0.16 142)" : undefined,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
        <Button
          data-ocid="shift_summary.close_button"
          className="w-full mt-3 h-11 rounded-xl font-semibold text-white"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.45 0.20 264) 0%, oklch(0.55 0.22 264) 100%)",
          }}
          onClick={onClose}
        >
          {ts.close}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
