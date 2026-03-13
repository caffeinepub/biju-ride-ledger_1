import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fuel, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatISTDate, getISTDateString, useStore } from "../store/useStore";

interface FuelHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FuelHistoryModal({
  open,
  onClose,
}: FuelHistoryModalProps) {
  const { fuelEntries, addFuelEntry, deleteFuelEntry, formatAmount } =
    useStore();
  const today = getISTDateString();

  const [showAddForm, setShowAddForm] = useState(false);
  const [date, setDate] = useState(today);
  const [odometerKm, setOdometerKm] = useState("");
  const [litres, setLitres] = useState("");
  const [cost, setCost] = useState("");

  // Compute estimated km until next fill for each entry
  const fuelHistory = useMemo(() => {
    const sorted = [...fuelEntries].sort((a, b) => a.odometerKm - b.odometerKm);
    return sorted
      .map((f, i) => {
        const next = sorted[i + 1];
        const estKmToNext = next ? next.odometerKm - f.odometerKm : null;
        return { ...f, estKmToNext };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [fuelEntries]);

  function handleAdd() {
    const odo = Number.parseFloat(odometerKm);
    const ltr = Number.parseFloat(litres);
    const cst = Number.parseFloat(cost);
    if (!date || Number.isNaN(odo) || Number.isNaN(ltr) || Number.isNaN(cst)) {
      toast.error("Please fill all fields with valid numbers");
      return;
    }
    addFuelEntry({ date, odometerKm: odo, litres: ltr, cost: cst });
    toast.success("Fuel entry saved");
    setOdometerKm("");
    setLitres("");
    setCost("");
    setDate(today);
    setShowAddForm(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Fuel size={18} style={{ color: "oklch(0.72 0.19 47)" }} />
              Fuel Log
            </DialogTitle>
            <Button
              data-ocid="fuelhistory.addfuel.button"
              size="sm"
              className="gap-1 h-8 rounded-lg text-white"
              style={{ background: "oklch(0.62 0.17 47)" }}
              onClick={() => setShowAddForm((v) => !v)}
            >
              <Plus size={14} />
              Add Fuel
            </Button>
          </div>
        </DialogHeader>

        {/* Add Form */}
        {showAddForm && (
          <div className="rounded-xl border border-border p-3 space-y-3 bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <Label className="text-xs">Date</Label>
                <Input
                  data-ocid="fuelhistory.date.input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Odometer (km)</Label>
                <Input
                  data-ocid="fuelhistory.odometer.input"
                  type="number"
                  placeholder="e.g. 12500"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  className="h-10 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Litres (L)</Label>
                <Input
                  data-ocid="fuelhistory.litres.input"
                  type="number"
                  placeholder="e.g. 5.0"
                  value={litres}
                  onChange={(e) => setLitres(e.target.value)}
                  className="h-10 mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Cost (₹)</Label>
                <Input
                  data-ocid="fuelhistory.cost.input"
                  type="number"
                  placeholder="e.g. 525"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="h-10 mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="fuelhistory.save.button"
                onClick={handleAdd}
                className="flex-1 h-10 text-white rounded-xl"
                style={{ background: "oklch(0.62 0.17 47)" }}
              >
                Save
              </Button>
              <Button
                data-ocid="fuelhistory.cancel.button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="h-10 w-10 rounded-xl p-0"
              >
                <X size={15} />
              </Button>
            </div>
          </div>
        )}

        {/* Fuel History List */}
        {fuelHistory.length === 0 ? (
          <div
            data-ocid="fuelhistory.empty_state"
            className="py-10 text-center text-muted-foreground text-sm"
          >
            <p className="text-3xl mb-2">⛽</p>
            No fuel entries yet. Tap "Add Fuel" to record your first fill.
          </div>
        ) : (
          <div className="space-y-2">
            {fuelHistory.map((f, i) => (
              <div
                key={f.id}
                data-ocid={`fuelhistory.item.${i + 1}`}
                className="rounded-xl border border-border p-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      {formatISTDate(f.date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Odometer: {f.odometerKm.toLocaleString()} km
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p
                        className="text-sm font-bold"
                        style={{ color: "oklch(0.62 0.17 47)" }}
                      >
                        {formatAmount(f.cost)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {f.litres} L
                      </p>
                    </div>
                    <Button
                      data-ocid={`fuelhistory.delete.button.${i + 1}`}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => {
                        deleteFuelEntry(f.id);
                        toast.success("Entry deleted");
                      }}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
                {f.estKmToNext !== null && (
                  <div
                    className="mt-2 flex items-center gap-1 text-xs rounded-lg px-2 py-1"
                    style={{
                      background: "oklch(0.72 0.19 47 / 0.10)",
                      color: "oklch(0.60 0.15 47)",
                    }}
                  >
                    <span>📍</span>
                    <span>
                      Est. {f.estKmToNext.toFixed(0)} km covered until next fill
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
