import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Save } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Header from "../components/Header";
import { getTranslations } from "../i18n";
import {
  PLATFORMS,
  type Platform,
  getISTDatetimeLocal,
  useStore,
} from "../store/useStore";

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

const PLATFORM_COLORS: Record<Platform, string> = {
  Uber: "#000000",
  InDrive: "#16a34a",
  YatriSathi: "#1a56db",
  Rapido: "#ea580c",
  Ola: "#eab308",
  Porter: "#0891b2",
  Other: "#6b7280",
};

interface AddRidePageProps {
  editRide?: {
    id: string;
    platform: Platform;
    fare: number;
    commission: number;
    tips: number;
    distance: number;
    pickupArea: string;
    dropArea: string;
    datetime: string;
    netIncome: number;
  } | null;
  onSaved?: () => void;
  onAvatarClick?: () => void;
}

export default function AddRidePage({
  editRide,
  onSaved,
  onAvatarClick,
}: AddRidePageProps) {
  const { addRide, updateRide, settings, getAreaSuggestions, formatAmount } =
    useStore();
  const t = getTranslations(settings.language);

  const [platform, setPlatform] = useState<Platform>(
    editRide?.platform || "Uber",
  );
  const [fare, setFare] = useState(editRide ? String(editRide.fare) : "");
  const [commission, setCommission] = useState(
    editRide ? String(editRide.commission) : "",
  );
  const [tips, setTips] = useState(editRide ? String(editRide.tips) : "0");
  const [distance, setDistance] = useState(
    editRide ? String(editRide.distance) : "",
  );
  const [pickupArea, setPickupArea] = useState(editRide?.pickupArea || "");
  const [dropArea, setDropArea] = useState(editRide?.dropArea || "");
  const [date, setDate] = useState(
    editRide ? editRide.datetime.slice(0, 16) : getISTDatetimeLocal(),
  );
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<string[]>([]);
  const [showPickupSugg, setShowPickupSugg] = useState(false);
  const [showDropSugg, setShowDropSugg] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(
    null,
  );

  // Auto-calculate commission when platform or fare changes
  useEffect(() => {
    if (editRide) return;
    const rule = settings.platformCommissions[platform];
    const fareNum = Number.parseFloat(fare) || 0;
    if (rule.type === "percentage")
      setCommission(String(((fareNum * rule.value) / 100).toFixed(2)));
    else if (rule.type === "fixed") setCommission(String(rule.value));
    else setCommission("0");
  }, [platform, fare, settings.platformCommissions, editRide]);

  const fareNum = Number.parseFloat(fare) || 0;
  const commissionNum = Number.parseFloat(commission) || 0;
  const tipsNum = Number.parseFloat(tips) || 0;
  const netIncome = fareNum - commissionNum + tipsNum;

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

  const handleSave = () => {
    if (!fare || fareNum <= 0) {
      toast.error("Please enter a valid fare");
      return;
    }
    const rideData = {
      platform,
      fare: fareNum,
      commission: commissionNum,
      tips: tipsNum,
      distance: Number.parseFloat(distance) || 0,
      pickupArea,
      dropArea,
      datetime: new Date(date).toISOString(),
      netIncome,
    };
    if (editRide) {
      updateRide(editRide.id, rideData);
      toast.success("Ride updated!");
    } else {
      addRide(rideData);
      toast.success("Ride saved!");
      setPlatform("Uber");
      setFare("");
      setCommission("");
      setTips("0");
      setDistance("");
      setPickupArea("");
      setDropArea("");
      setDate(getISTDatetimeLocal());
    }
    onSaved?.();
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
        {/* Voice Button */}
        <div className="flex justify-end mb-3">
          <Button
            data-ocid="addride.voice.button"
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl"
            onClick={listening ? stopVoice : startVoice}
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
          <div className="grid grid-cols-4 gap-2">
            {PLATFORMS.map((p, idx) => {
              const isSelected = platform === p;
              return (
                <button
                  key={p}
                  type="button"
                  data-ocid="addride.platform.toggle"
                  onClick={() => setPlatform(p)}
                  className="relative rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95"
                  style={{
                    background: isSelected
                      ? PLATFORM_COLORS[p]
                      : "oklch(var(--muted))",
                    color: isSelected
                      ? "white"
                      : "oklch(var(--muted-foreground))",
                    boxShadow: isSelected
                      ? `0 2px 8px ${PLATFORM_COLORS[p]}55`
                      : undefined,
                  }}
                >
                  <span className="opacity-50 text-[9px] absolute top-1 left-1.5">
                    {idx + 1}
                  </span>
                  {p}
                </button>
              );
            })}
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">{t.addRide.fare}</Label>
              <Input
                data-ocid="addride.fare.input"
                type="number"
                placeholder="120"
                value={fare}
                onChange={(e) => setFare(e.target.value)}
                className="mt-1 h-12 text-base"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-xs">{t.addRide.commission}</Label>
              <Input
                data-ocid="addride.commission.input"
                type="number"
                placeholder="0"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="mt-1 h-12 text-base"
              />
            </div>
            <div>
              <Label className="text-xs">{t.addRide.tips}</Label>
              <Input
                data-ocid="addride.tips.input"
                type="number"
                placeholder="0"
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                className="mt-1 h-12 text-base"
              />
            </div>
          </div>

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

          <div>
            <Label className="text-xs">{t.addRide.date}</Label>
            <Input
              data-ocid="addride.datetime.input"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 h-12 text-base"
            />
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
      </main>
    </div>
  );
}
