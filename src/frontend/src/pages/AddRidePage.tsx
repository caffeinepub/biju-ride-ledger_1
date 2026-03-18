import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, MicOff, Save, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Header from "../components/Header";
import QuickRideModal from "../components/QuickRideModal";
import { getTranslations } from "../i18n";
import { calcRunKm } from "../store/kmUtils";
import {
  PLATFORMS,
  type Platform,
  type Ride,
  getISTDateString,
  useStore,
} from "../store/useStore";
import { useSound } from "../utils/useSound";

// Speech Recognition type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}
declare const SpeechRecognition: { new (): SpeechRecognition };

interface AddRidePageProps {
  editRide?: Ride | null;
  onSaved?: () => void;
  onAvatarClick?: () => void;
  onTargetReached?: () => void;
}

export default function AddRidePage({
  editRide,
  onSaved,
  onAvatarClick,
  onTargetReached,
}: AddRidePageProps) {
  const {
    addRide,
    updateRide,
    settings,
    rides,
    odometerSessions,
    getAreaSuggestions,
    formatAmount,
  } = useStore();
  const t = getTranslations(settings.language);
  const { playClick, playSuccess } = useSound();

  const [platform, setPlatform] = useState<Platform>(
    editRide?.platform || "Uber",
  );
  const [paymentType, setPaymentType] = useState<"cash_upi" | "app_online">(
    () => {
      if (!editRide?.paymentType) return "cash_upi";
      if (
        editRide.paymentType === "cash" ||
        editRide.paymentType === "cash_upi"
      )
        return "cash_upi";
      return "app_online";
    },
  );
  const [fare, setFare] = useState(editRide ? String(editRide.fare) : "");
  const [commission, setCommission] = useState(
    editRide ? String(editRide.commission) : "",
  );
  const [tips, setTips] = useState(editRide ? String(editRide.tips) : "");
  const [customerPaid, setCustomerPaid] = useState("");
  const [distance, setDistance] = useState(
    editRide ? String(editRide.distance) : "",
  );
  const [pickupArea, setPickupArea] = useState(editRide?.pickupArea || "");
  const [dropArea, setDropArea] = useState(editRide?.dropArea || "");

  // Separate ride date and time
  const [rideDate, setRideDate] = useState(() => {
    if (editRide?.ride_date) return editRide.ride_date;
    if (editRide?.datetime) return editRide.datetime.slice(0, 10);
    return getISTDateString();
  });
  const [rideTime, setRideTime] = useState(() => {
    if (editRide?.datetime) {
      const d = new Date(editRide.datetime);
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    }
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });

  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<string[]>([]);
  const [showPickupSugg, setShowPickupSugg] = useState(false);
  const [showDropSugg, setShowDropSugg] = useState(false);
  const [listening, setListening] = useState(false);
  const [quickRideOpen, setQuickRideOpen] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showKmWarning, setShowKmWarning] = useState(false);
  const pendingRideDataRef = useRef<Omit<Ride, "id"> | null>(null);
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(
    null,
  );

  // Auto-calculate commission when platform or fare changes (new rides only)
  useEffect(() => {
    if (editRide) return;
    const rule = settings.platformCommissions[platform];
    const fareNum = Number.parseFloat(fare) || 0;
    if (rule.type === "percentage")
      setCommission(String(((fareNum * rule.value) / 100).toFixed(2)));
    else if (rule.type === "fixed") setCommission(String(rule.value));
    else setCommission("");
  }, [platform, fare, settings.platformCommissions, editRide]);

  // Auto-calculate tips/netIncome based on payment type (Cash/UPI only)
  const handleCustomerPaidChange = (val: string) => {
    setCustomerPaid(val);
    if (paymentType === "cash_upi") {
      const paid = Number.parseFloat(val) || 0;
      if (paid > 0) {
        const fareNum = Number.parseFloat(fare) || 0;
        const calculatedTip = paid - fareNum;
        setTips(calculatedTip >= 0 ? String(calculatedTip.toFixed(2)) : "0");
      }
    }
  };

  const fareNum = Number.parseFloat(fare) || 0;
  const commissionNum = Number.parseFloat(commission) || 0;
  const tipsNum = Number.parseFloat(tips) || 0;
  const customerPaidNum = Number.parseFloat(customerPaid) || 0;

  // Net income varies by payment type
  const netIncome =
    paymentType === "cash_upi" && customerPaidNum > 0
      ? customerPaidNum - commissionNum
      : fareNum - commissionNum + tipsNum;

  const handlePickupChange = (val: string) => {
    setPickupArea(val);
    const sugg = getAreaSuggestions(val);
    setPickupSuggestions(sugg);
    setShowPickupSugg(sugg.length > 0 && val.length > 0);
  };

  const handleDropChange = (val: string) => {
    setDropArea(val);
    const sugg = getAreaSuggestions(val);
    setDropSuggestions(sugg);
    setShowDropSugg(sugg.length > 0 && val.length > 0);
  };

  const buildRideData = (): Omit<Ride, "id"> => {
    const timeStr = rideTime || "00:00";
    const datetime = new Date(`${rideDate}T${timeStr}:00+05:30`).toISOString();
    return {
      platform,
      fare: fareNum,
      commission: commissionNum,
      tips: tipsNum,
      distance: Number.parseFloat(distance) || 0,
      pickupArea,
      dropArea,
      datetime,
      netIncome,
      paymentType,
      ride_date: rideDate,
      entry_timestamp: new Date().toISOString(),
    };
  };

  const checkDuplicate = (rideData: Omit<Ride, "id">): boolean => {
    if (editRide) return false; // Skip check when editing
    return rides.some(
      (r) =>
        r.fare === rideData.fare &&
        r.distance === rideData.distance &&
        r.platform === rideData.platform &&
        (r.ride_date || r.datetime.slice(0, 10)) === rideData.ride_date,
    );
  };

  const commitSave = (rideData: Omit<Ride, "id">) => {
    if (editRide) {
      updateRide(editRide.id, rideData);
      toast.success("Ride updated!");
      playSuccess();
    } else {
      addRide(rideData);
      toast.success("Ride saved!");
      playSuccess();

      // Check if daily target crossed for first time today
      const todayKey = `biju_target_celebrated_${getISTDateString()}`;
      if (!localStorage.getItem(todayKey)) {
        const todayStr = getISTDateString();
        const todayTotal =
          rides
            .filter(
              (r) => (r.ride_date || r.datetime.slice(0, 10)) === todayStr,
            )
            .reduce((sum, r) => sum + r.netIncome, 0) + netIncome;
        if (todayTotal >= settings.dailyTarget && settings.dailyTarget > 0) {
          localStorage.setItem(todayKey, "1");
          onTargetReached?.();
        }
      }

      setPlatform("Uber");
      setPaymentType("cash_upi");
      setFare("");
      setCommission("");
      setTips("");
      setCustomerPaid("");
      setDistance("");
      setPickupArea("");
      setDropArea("");
      setRideDate(getISTDateString());
      const now = new Date();
      setRideTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      );
    }
    onSaved?.();
  };

  const handleSave = () => {
    if (!fare || fareNum <= 0) {
      toast.error("Please enter a valid fare");
      return;
    }
    const rideData = buildRideData();
    // KM validation: warn if total Ride KM exceeds Run KM from odometer for the selected ride date
    const rideDateOdoSession = odometerSessions.find(
      (s) => s.date === rideDate,
    );
    const rideDateRunKm = rideDateOdoSession
      ? calcRunKm(rideDateOdoSession.startKm, rideDateOdoSession.endKm)
      : 0;
    const existingRideKm = rides
      .filter((r) => (r.ride_date || r.datetime.slice(0, 10)) === rideDate)
      .reduce((s, r) => s + r.distance, 0);
    const newRideKm = Number.parseFloat(distance) || 0;
    if (rideDateRunKm > 0 && existingRideKm + newRideKm > rideDateRunKm) {
      pendingRideDataRef.current = rideData;
      setShowKmWarning(true);
      return;
    }
    if (checkDuplicate(rideData)) {
      pendingRideDataRef.current = rideData;
      setShowDuplicateDialog(true);
      return;
    }
    commitSave(rideData);
  };

  const startVoice = useCallback(() => {
    const SR =
      (
        window as Window & {
          SpeechRecognition?: typeof SpeechRecognition;
          webkitSpeechRecognition?: typeof SpeechRecognition;
        }
      ).SpeechRecognition ||
      (
        window as Window & {
          webkitSpeechRecognition?: typeof SpeechRecognition;
        }
      ).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice entry not supported in this browser");
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript.toLowerCase();
      const platformMatch = PLATFORMS.find((p) =>
        text.includes(p.toLowerCase()),
      );
      if (platformMatch) setPlatform(platformMatch);
      const fareMatch = text.match(
        /(\d+(?:\.\d+)?)(?:\s+(?:rupees?|rs|fare))?/,
      );
      if (fareMatch) setFare(fareMatch[1]);
      const tipMatch = text.match(/tip\s+(\d+(?:\.\d+)?)/);
      if (tipMatch) setTips(tipMatch[1]);
      const distMatch = text.match(/distance\s+(\d+(?:\.\d+)?)/);
      if (distMatch) setDistance(distMatch[1]);
      toast.success(`Heard: "${text}"`);
      setListening(false);
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error("Voice recognition failed");
    };
    recognition.onend = () => setListening(false);
  }, []);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={t.addRide.title} onAvatarClick={onAvatarClick} />
      <main className="flex-1 px-4 py-4">
        {/* Quick Ride Button */}
        <Button
          data-ocid="addride.quickride.button"
          className="w-full h-12 rounded-xl font-bold gap-2 text-white mb-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.52 0.17 47) 0%, oklch(0.62 0.19 47) 100%)",
          }}
          onClick={() => setQuickRideOpen(true)}
        >
          <Zap size={18} />
          QUICK RIDE
        </Button>
        {/* Voice Button */}
        <div className="flex justify-end mb-3">
          <Button
            data-ocid="addride.voice.button"
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl"
            onClick={() => {
              playClick();
              if (listening) stopVoice();
              else startVoice();
            }}
            style={{
              borderColor: listening
                ? "oklch(0.62 0.22 27)"
                : "oklch(var(--border))",
              color: listening ? "oklch(0.62 0.22 27)" : undefined,
            }}
          >
            {listening ? <MicOff size={15} /> : <Mic size={15} />}
            {listening ? "Stop" : "Voice"}
          </Button>
        </div>

        {/* Platform selector */}
        <div className="mb-4">
          <Label className="text-xs mb-2 block">{t.addRide.platform}</Label>
          <Select
            value={platform}
            onValueChange={(v) => setPlatform(v as Platform)}
          >
            <SelectTrigger
              data-ocid="addride.platform.select"
              className="h-12 text-base rounded-xl"
            >
              <SelectValue placeholder="Select Platform" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p, idx) => (
                <SelectItem key={p} value={p}>
                  <span className="text-muted-foreground text-xs mr-1.5">
                    {idx + 1}.
                  </span>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Type Toggle */}
        <div className="mb-4">
          <Label className="text-xs mb-2 block">Payment Type</Label>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="addride.paymenttype.cash"
              onClick={() => {
                setPaymentType("cash_upi");
                setCustomerPaid("");
              }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background:
                  paymentType === "cash_upi"
                    ? "oklch(0.58 0.21 264)"
                    : "oklch(var(--muted))",
                color:
                  paymentType === "cash_upi"
                    ? "white"
                    : "oklch(var(--muted-foreground))",
              }}
            >
              💵 Cash / UPI
            </button>
            <button
              type="button"
              data-ocid="addride.paymenttype.online"
              onClick={() => {
                setPaymentType("app_online");
                setCustomerPaid("");
              }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background:
                  paymentType === "app_online"
                    ? "oklch(0.58 0.21 264)"
                    : "oklch(var(--muted))",
                color:
                  paymentType === "app_online"
                    ? "white"
                    : "oklch(var(--muted-foreground))",
              }}
            >
              📱 App Online
            </button>
          </div>
        </div>

        {/* Net Income Banner */}
        <motion.div
          key={netIncome}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          className="rounded-2xl p-4 mb-4 text-center"
          style={{
            background: "oklch(0.65 0.15 142 / 0.15)",
            border: "1px solid oklch(0.65 0.15 142 / 0.3)",
          }}
        >
          <p className="text-xs text-muted-foreground">{t.addRide.netIncome}</p>
          <p
            className="text-3xl font-bold font-display"
            style={{ color: "oklch(0.65 0.15 142)" }}
          >
            {formatAmount(netIncome)}
          </p>
        </motion.div>

        {/* Form Fields */}
        <div className="space-y-3">
          {/* Fare + Commission + Tips row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="font-semibold text-xs text-foreground block mb-1">
                {t.addRide.fare}
              </Label>
              <Input
                data-ocid="addride.fare.input"
                type="number"
                placeholder="120"
                value={fare}
                onChange={(e) => setFare(e.target.value)}
                className="h-12 text-base"
                autoFocus
              />
            </div>
            <div>
              <Label className="font-semibold text-xs text-foreground block mb-1">
                {t.addRide.commission}
              </Label>
              <Input
                data-ocid="addride.commission.input"
                type="number"
                placeholder="Auto"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div>
              <Label className="font-semibold text-xs text-foreground block mb-1">
                {t.addRide.tips}
              </Label>
              <Input
                data-ocid="addride.tips.input"
                type="number"
                placeholder={paymentType === "app_online" ? "Tip" : "Auto"}
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                className="h-12 text-base"
                readOnly={paymentType === "cash_upi" && customerPaid !== ""}
              />
            </div>
          </div>

          {/* Customer Paid — visible for Cash/UPI only */}
          {paymentType === "cash_upi" && (
            <div>
              <Label className="text-xs">Customer Paid (₹)</Label>
              <Input
                data-ocid="addride.customerpaid.input"
                type="number"
                placeholder="e.g. 110"
                value={customerPaid}
                onChange={(e) => handleCustomerPaidChange(e.target.value)}
                className="mt-1 h-12 text-base"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customerPaidNum > 0
                  ? `Tip: ${formatAmount(tipsNum)} · Net: ${formatAmount(netIncome)}`
                  : "Enter amount customer handed you"}
              </p>
            </div>
          )}

          <div>
            <Label className="text-xs">{t.addRide.distance}</Label>
            <Input
              data-ocid="addride.distance.input"
              type="number"
              placeholder="5.2"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="mt-1 h-12 text-base"
            />
          </div>

          <div className="relative">
            <Label className="text-xs">{t.addRide.pickup}</Label>
            <Input
              data-ocid="addride.pickup.input"
              placeholder="e.g. Sector 5"
              value={pickupArea}
              onChange={(e) => handlePickupChange(e.target.value)}
              onFocus={() =>
                pickupSuggestions.length > 0 && setShowPickupSugg(true)
              }
              onBlur={() => setTimeout(() => setShowPickupSugg(false), 150)}
              className="mt-1 h-12 text-base"
            />
            {showPickupSugg && (
              <div className="absolute z-20 left-0 right-0 bg-popover border border-border rounded-xl mt-1 shadow-lg overflow-hidden">
                {pickupSuggestions.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted"
                    onClick={() => {
                      setPickupArea(s);
                      setShowPickupSugg(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Label className="text-xs">{t.addRide.drop}</Label>
            <Input
              data-ocid="addride.drop.input"
              placeholder="e.g. Airport"
              value={dropArea}
              onChange={(e) => handleDropChange(e.target.value)}
              onFocus={() =>
                dropSuggestions.length > 0 && setShowDropSugg(true)
              }
              onBlur={() => setTimeout(() => setShowDropSugg(false), 150)}
              className="mt-1 h-12 text-base"
            />
            {showDropSugg && (
              <div className="absolute z-20 left-0 right-0 bg-popover border border-border rounded-xl mt-1 shadow-lg overflow-hidden">
                {dropSuggestions.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted"
                    onClick={() => {
                      setDropArea(s);
                      setShowDropSugg(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ride Date and Time — split fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs block mb-1">Ride Date</Label>
              <Input
                data-ocid="addride.ridedate.input"
                type="date"
                value={rideDate}
                onChange={(e) => setRideDate(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div>
              <Label className="text-xs block mb-1">Ride Time (optional)</Label>
              <Input
                data-ocid="addride.ridetime.input"
                type="time"
                value={rideTime}
                onChange={(e) => setRideTime(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>
        </div>

        <Button
          data-ocid="addride.save.button"
          className="w-full h-14 rounded-xl text-base font-bold gap-2 text-white mt-6 active:scale-[0.98] transition-transform"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.58 0.21 264), oklch(0.72 0.19 47))",
            boxShadow: "0 4px 20px -4px oklch(0.65 0.20 264 / 0.5)",
          }}
          onClick={handleSave}
        >
          <Save size={20} />
          {editRide ? "Update Ride" : t.addRide.saveRide}
        </Button>
        <QuickRideModal
          open={quickRideOpen}
          onClose={() => setQuickRideOpen(false)}
        />

        {/* KM Warning Dialog */}
        <AlertDialog open={showKmWarning} onOpenChange={setShowKmWarning}>
          <AlertDialogContent data-ocid="addride.kmwarning.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Ride KM Exceeds Run KM</AlertDialogTitle>
              <AlertDialogDescription>
                Today&apos;s total Ride KM exceeds the Run KM recorded from the
                odometer. This may indicate unrealistic data. Save anyway?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-ocid="addride.kmwarning.cancel_button"
                onClick={() => {
                  setShowKmWarning(false);
                  pendingRideDataRef.current = null;
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="addride.kmwarning.confirm_button"
                onClick={() => {
                  if (pendingRideDataRef.current) {
                    const rideData = pendingRideDataRef.current;
                    pendingRideDataRef.current = null;
                    setShowKmWarning(false);
                    if (checkDuplicate(rideData)) {
                      pendingRideDataRef.current = rideData;
                      setShowDuplicateDialog(true);
                      return;
                    }
                    commitSave(rideData);
                  }
                  setShowKmWarning(false);
                }}
              >
                Save Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Duplicate Detection Dialog */}
        <AlertDialog
          open={showDuplicateDialog}
          onOpenChange={setShowDuplicateDialog}
        >
          <AlertDialogContent data-ocid="addride.duplicate.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Possible Duplicate Ride</AlertDialogTitle>
              <AlertDialogDescription>
                A ride with the same fare, distance, platform, and date already
                exists. Save anyway?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-ocid="addride.duplicate.cancel_button"
                onClick={() => {
                  setShowDuplicateDialog(false);
                  pendingRideDataRef.current = null;
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="addride.duplicate.confirm_button"
                onClick={() => {
                  if (pendingRideDataRef.current) {
                    commitSave(pendingRideDataRef.current);
                    pendingRideDataRef.current = null;
                  }
                  setShowDuplicateDialog(false);
                }}
              >
                Save Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
