import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { getTranslations } from "../i18n";
import { useStore } from "../store/useStore";

interface FuelEntryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FuelEntryModal({ open, onClose }: FuelEntryModalProps) {
  const { addFuelEntry, settings } = useStore();
  const t = getTranslations(settings.language);
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [odometerKm, setOdometerKm] = useState("");
  const [litres, setLitres] = useState("");
  const [cost, setCost] = useState("");

  const handleSave = () => {
    const odo = Number.parseFloat(odometerKm);
    const lit = Number.parseFloat(litres);
    const cst = Number.parseFloat(cost);
    if (!date || Number.isNaN(odo) || Number.isNaN(lit) || Number.isNaN(cst)) {
      toast.error("Please fill all fields correctly");
      return;
    }
    addFuelEntry({ date, odometerKm: odo, litres: lit, cost: cst });
    toast.success("Fuel entry saved!");
    setDate(today);
    setOdometerKm("");
    setLitres("");
    setCost("");
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
