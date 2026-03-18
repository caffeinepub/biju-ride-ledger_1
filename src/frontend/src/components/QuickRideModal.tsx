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
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  PLATFORMS,
  type Platform,
  getISTDatetimeLocal,
  useStore,
} from "../store/useStore";

interface QuickRideModalProps {
  open: boolean;
  onClose: () => void;
}

export default function QuickRideModal({ open, onClose }: QuickRideModalProps) {
  const { addRide, settings, formatAmount } = useStore();
  const [platform, setPlatform] = useState<Platform>("Uber");
  const [fare, setFare] = useState("");
  const [rideKm, setRideKm] = useState("");
  const [paymentType, setPaymentType] = useState<"cash_upi" | "app_online">(
    "cash_upi",
  );
  const [tip, setTip] = useState("");
  const [area, setArea] = useState("");
  const [commission, setCommission] = useState("");

  useEffect(() => {
    const rule = settings.platformCommissions[platform];
    const fareNum = Number.parseFloat(fare) || 0;
    if (rule.type === "percentage")
      setCommission(String(((fareNum * rule.value) / 100).toFixed(2)));
    else if (rule.type === "fixed") setCommission(String(rule.value));
    else setCommission("");
  }, [platform, fare, settings.platformCommissions]);

  const fareNum = Number.parseFloat(fare) || 0;
  const commissionNum = Number.parseFloat(commission) || 0;
  const tipNum = Number.parseFloat(tip) || 0;
  const netIncome = fareNum - commissionNum + tipNum;

  const handleSave = () => {
    if (!fare || fareNum <= 0) {
      toast.error("Please enter a valid fare");
      return;
    }
    addRide({
      platform,
      fare: fareNum,
      commission: commissionNum,
      tips: tipNum,
      distance: Number.parseFloat(rideKm) || 0,
      pickupArea: area,
      dropArea: "",
      datetime: new Date(getISTDatetimeLocal()).toISOString(),
      netIncome,
      paymentType,
    });
    toast.success("Ride saved!");
    setPlatform("Uber");
    setFare("");
    setRideKm("");
    setPaymentType("cash_upi");
    setTip("");
    setArea("");
    setCommission("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="quick_ride.dialog"
        className="rounded-2xl max-w-sm mx-auto"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Zap size={18} style={{ color: "oklch(0.72 0.19 47)" }} />
            <DialogTitle className="font-display font-bold">
              Quick Ride
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* Platform */}
          <div>
            <Label className="text-xs mb-1 block">Platform</Label>
            <Select
              value={platform}
              onValueChange={(v) => setPlatform(v as Platform)}
            >
              <SelectTrigger
                data-ocid="quick_ride.platform.select"
                className="h-11 rounded-xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p, i) => (
                  <SelectItem key={p} value={p}>
                    <span className="text-muted-foreground text-xs mr-1.5">
                      {i + 1}.
                    </span>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fare + KM */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs mb-1 block">Fare (₹)</Label>
              <Input
                data-ocid="quick_ride.fare.input"
                type="number"
                placeholder="e.g. 150"
                value={fare}
                onChange={(e) => setFare(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Ride KM</Label>
              <Input
                data-ocid="quick_ride.km.input"
                type="number"
                placeholder="e.g. 8.5"
                value={rideKm}
                onChange={(e) => setRideKm(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Payment Type */}
          <div>
            <Label className="text-xs mb-1 block">Payment Type</Label>
            <div className="flex gap-2">
              {(["cash_upi", "app_online"] as const).map((pt) => (
                <button
                  key={pt}
                  type="button"
                  data-ocid={`quick_ride.${pt}.toggle`}
                  onClick={() => setPaymentType(pt)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background:
                      paymentType === pt
                        ? "oklch(0.52 0.21 264)"
                        : "oklch(var(--muted))",
                    color:
                      paymentType === pt
                        ? "white"
                        : "oklch(var(--muted-foreground))",
                  }}
                >
                  {pt === "cash_upi" ? "💵 Cash / UPI" : "📱 App Online"}
                </button>
              ))}
            </div>
          </div>

          {/* Tip + Area */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs mb-1 block">Tip (optional)</Label>
              <Input
                data-ocid="quick_ride.tip.input"
                type="number"
                placeholder="₹0"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Area (optional)</Label>
              <Input
                data-ocid="quick_ride.area.input"
                type="text"
                placeholder="Pickup area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Net Income preview */}
          <div
            className="rounded-xl p-3 text-center"
            style={{
              background: "oklch(0.58 0.16 142 / 0.12)",
              border: "1px solid oklch(0.58 0.16 142 / 0.25)",
            }}
          >
            <p className="text-xs text-muted-foreground">Net Income</p>
            <p
              className="text-xl font-bold"
              style={{ color: "oklch(0.48 0.16 142)" }}
            >
              {formatAmount(netIncome)}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              data-ocid="quick_ride.cancel_button"
              variant="outline"
              className="flex-1 h-11 rounded-xl"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              data-ocid="quick_ride.submit_button"
              className="flex-1 h-11 rounded-xl font-semibold text-white"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.20 264) 0%, oklch(0.55 0.22 264) 100%)",
              }}
              onClick={handleSave}
            >
              Save Ride
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
