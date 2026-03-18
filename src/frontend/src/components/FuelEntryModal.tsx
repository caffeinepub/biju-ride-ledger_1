import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { getTranslations } from "../i18n";
import { useStore } from "../store/useStore";

type FuelType = "petrol" | "diesel" | "cng" | "electric" | "hybrid";

interface FuelEntryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FuelEntryModal({ open, onClose }: FuelEntryModalProps) {
  const { addFuelEntry, settings } = useStore();
  const t = getTranslations(settings.language);
  const today = new Date().toISOString().slice(0, 10);

  const [fuelType, setFuelType] = useState<FuelType>("petrol");
  const [date, setDate] = useState(today);
  const [odometerKm, setOdometerKm] = useState("");
  const [litres, setLitres] = useState("");
  const [cost, setCost] = useState("");

  const isElectric = fuelType === "electric" || fuelType === "hybrid";

  const handleSave = () => {
    const odo = Number.parseFloat(odometerKm);
    if (!date || Number.isNaN(odo)) {
      toast.error(t.fuel.toastError);
      return;
    }
    if (!isElectric) {
      const lit = Number.parseFloat(litres);
      const cst = Number.parseFloat(cost);
      if (Number.isNaN(lit) || Number.isNaN(cst)) {
        toast.error(t.fuel.toastError);
        return;
      }
      addFuelEntry({ date, odometerKm: odo, litres: lit, cost: cst });
    } else {
      // Electric: no fuel cost, use 0 for litres and cost
      addFuelEntry({ date, odometerKm: odo, litres: 0, cost: 0 });
    }
    toast.success(t.fuel.toastSuccess);
    setDate(today);
    setOdometerKm("");
    setLitres("");
    setCost("");
    setFuelType("petrol");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-sm mx-4 rounded-2xl"
        data-ocid="fuel.modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display">{t.fuel.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Fuel Type Selector */}
          <div>
            <Label>{t.fuel.type}</Label>
            <Select
              value={fuelType}
              onValueChange={(v) => setFuelType(v as FuelType)}
            >
              <SelectTrigger
                data-ocid="fuel.type.select"
                className="mt-1 h-11 rounded-xl"
              >
                <SelectValue placeholder={t.fuel.selectType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="petrol">{t.fuel.petrol}</SelectItem>
                <SelectItem value="diesel">{t.fuel.diesel}</SelectItem>
                <SelectItem value="cng">{t.fuel.cng}</SelectItem>
                <SelectItem value="electric">{t.fuel.electric}</SelectItem>
                <SelectItem value="hybrid">
                  {t.fuel.hybrid || "Hybrid"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Electric notice */}
          {isElectric && (
            <div
              className="rounded-xl px-3 py-2.5 text-sm"
              style={{
                background: "oklch(0.58 0.16 142 / 0.12)",
                border: "1px solid oklch(0.58 0.16 142 / 0.25)",
                color: "oklch(0.42 0.14 142)",
              }}
            >
              ⚡ {t.fuel.electricNote}
            </div>
          )}

          <div>
            <Label>{t.fuel.date}</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t.fuel.odometer}</Label>
            <Input
              data-ocid="fuel.odometer.input"
              type="number"
              placeholder="e.g. 12500"
              value={odometerKm}
              onChange={(e) => setOdometerKm(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Litres + Cost — hidden for Electric */}
          {!isElectric && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t.fuel.litres}</Label>
                <Input
                  data-ocid="fuel.litres.input"
                  type="number"
                  placeholder="e.g. 3.5"
                  value={litres}
                  onChange={(e) => setLitres(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t.fuel.cost}</Label>
                <Input
                  data-ocid="fuel.cost.input"
                  type="number"
                  placeholder="e.g. 368"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <Button
            data-ocid="fuel.save.button"
            className="w-full h-12 text-base font-semibold rounded-xl"
            style={{ background: "oklch(0.72 0.19 47)", color: "white" }}
            onClick={handleSave}
          >
            {t.fuel.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
