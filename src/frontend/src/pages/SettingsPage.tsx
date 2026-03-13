import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Header from "../components/Header";
import { getTranslations } from "../i18n";
import {
  type CommissionType,
  type Platform,
  useStore,
} from "../store/useStore";

const PLATFORMS: Platform[] = [
  "Uber",
  "InDrive",
  "YatriSathi",
  "Rapido",
  "Ola",
  "Porter",
  "Other",
];

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const t = getTranslations(settings.language);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [driverName, setDriverName] = useState(settings.driverName);
  const [vehicleType, setVehicleType] = useState(settings.vehicleType);
  const [city, setCity] = useState(settings.city);
  const [dailyTarget, setDailyTarget] = useState(String(settings.dailyTarget));
  const [fuelPrice, setFuelPrice] = useState(
    String(settings.fuelPricePerLitre),
  );
  const [platformCommissions, setPlatformCommissions] = useState({
    ...settings.platformCommissions,
  });

  const handleSave = () => {
    updateSettings({
      driverName,
      vehicleType: vehicleType as "Bike" | "Car" | "Auto" | "Other",
      city,
      dailyTarget: Number.parseFloat(dailyTarget) || 1000,
      fuelPricePerLitre: Number.parseFloat(fuelPrice) || 105,
      platformCommissions,
    });
    toast.success("Settings saved!");
  };

  const handlePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      updateSettings({ profilePicture: result });
    };
    reader.readAsDataURL(file);
  };

  const updateCommission = (
    platform: Platform,
    field: "type" | "value",
    val: string,
  ) => {
    setPlatformCommissions((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: field === "value" ? Number.parseFloat(val) || 0 : val,
      },
    }));
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={t.settings.title} />
      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Driver Profile */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold mb-4">
            {t.settings.profile}
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={settings.profilePicture} />
                <AvatarFallback className="text-xl">
                  {driverName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="settings.upload_button"
              >
                <Camera size={12} className="text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePicture}
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{driverName || "Driver"}</p>
              <p className="text-sm text-muted-foreground">
                {vehicleType} • {city || "City not set"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label>{t.settings.driverName}</Label>
              <Input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="mt-1"
                placeholder="Your name"
              />
            </div>
            <div>
              <Label>{t.settings.vehicleType}</Label>
              <Select
                value={vehicleType}
                onValueChange={(v) =>
                  setVehicleType(v as "Bike" | "Car" | "Auto" | "Other")
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Bike", "Car", "Auto", "Other"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.settings.city}</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1"
                placeholder="Your city"
              />
            </div>
          </div>
        </div>

        {/* Daily Target */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <Label className="font-semibold font-display">
            {t.settings.dailyTarget}
          </Label>
          <Input
            type="number"
            value={dailyTarget}
            onChange={(e) => setDailyTarget(e.target.value)}
            className="mt-2 h-12 text-base"
          />
        </div>

        {/* Platform Commissions */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold mb-3">
            {t.settings.platformCommissions}
          </h3>
          <Accordion type="single" collapsible>
            {PLATFORMS.map((platform) => (
              <AccordionItem key={platform} value={platform}>
                <AccordionTrigger className="text-sm font-semibold">
                  {platform}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pb-2">
                    <div>
                      <Label className="text-xs">
                        {t.settings.commissionType}
                      </Label>
                      <Select
                        value={platformCommissions[platform].type}
                        onValueChange={(v) =>
                          updateCommission(platform, "type", v)
                        }
                      >
                        <SelectTrigger
                          data-ocid="settings.commission.select"
                          className="mt-1 h-10"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Commission</SelectItem>
                          <SelectItem value="percentage">
                            Percentage (%)
                          </SelectItem>
                          <SelectItem value="fixed">
                            Fixed Amount (₹)
                          </SelectItem>
                          <SelectItem value="daily_fee">
                            Daily Platform Fee (₹)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {platformCommissions[platform].type !== "none" && (
                      <div>
                        <Label className="text-xs">
                          {t.settings.commissionValue}
                        </Label>
                        <Input
                          type="number"
                          value={String(platformCommissions[platform].value)}
                          onChange={(e) =>
                            updateCommission(platform, "value", e.target.value)
                          }
                          className="mt-1 h-10 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Fuel Settings */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <Label className="font-semibold font-display">
            {t.settings.fuelPrice}
          </Label>
          <Input
            type="number"
            value={fuelPrice}
            onChange={(e) => setFuelPrice(e.target.value)}
            className="mt-2 h-12 text-base"
          />
        </div>

        {/* Language */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold mb-3">
            {t.settings.language}
          </h3>
          <div className="flex gap-2" data-ocid="settings.language.toggle">
            {(
              [
                ["en", "English"],
                ["bn", "\u09ac\u09be\u0982\u09b2\u09be"],
                ["hi", "\u0939\u093f\u0928\u094d\u09a6\u09c0"],
              ] as const
            ).map(([code, label]) => (
              <button
                type="button"
                key={code}
                onClick={() => updateSettings({ language: code })}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background:
                    settings.language === code
                      ? "oklch(0.58 0.21 264)"
                      : "oklch(var(--muted))",
                  color:
                    settings.language === code
                      ? "white"
                      : "oklch(var(--muted-foreground))",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold mb-3">
            {t.settings.currency}
          </h3>
          <div className="flex gap-2" data-ocid="settings.currency.toggle">
            {(
              [
                ["INR", "\u20b9 INR"],
                ["BDT", "\u09f3 BDT"],
                ["USD", "$ USD"],
              ] as const
            ).map(([code, label]) => (
              <button
                type="button"
                key={code}
                onClick={() => updateSettings({ currency: code })}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background:
                    settings.currency === code
                      ? "oklch(0.72 0.19 47)"
                      : "oklch(var(--muted))",
                  color:
                    settings.currency === code
                      ? "white"
                      : "oklch(var(--muted-foreground))",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button
          data-ocid="settings.save.button"
          className="w-full h-14 rounded-xl text-base font-bold text-white"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.58 0.21 264), oklch(0.72 0.19 47))",
          }}
          onClick={handleSave}
        >
          {t.settings.save}
        </Button>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </footer>
      </main>
    </div>
  );
}
