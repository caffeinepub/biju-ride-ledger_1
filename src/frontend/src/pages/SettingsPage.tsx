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
import { useState } from "react";
import Header from "../components/Header";
import { getTranslations } from "../i18n";
import {
  type CommissionType,
  PLATFORMS,
  type Platform,
  useStore,
} from "../store/useStore";

interface SettingsPageProps {
  onAvatarClick?: () => void;
  appTheme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

export default function SettingsPage({
  onAvatarClick,
  appTheme,
  onThemeChange,
}: SettingsPageProps) {
  const { settings, updateSettings } = useStore();
  const t = getTranslations(settings.language);

  const [fuelPrice, setFuelPrice] = useState(
    String(settings.fuelPricePerLitre),
  );
  const [platformCommissions, setPlatformCommissions] = useState({
    ...settings.platformCommissions,
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("biju_sound_enabled") !== "false";
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem("biju_notifications") !== "false";
  });
  const [selectedCommissionPlatform, setSelectedCommissionPlatform] = useState<
    Platform | ""
  >("");

  const updateCommission = (
    platform: Platform,
    field: "type" | "value",
    val: string,
  ) => {
    setPlatformCommissions((prev) => {
      const updated = {
        ...prev,
        [platform]: {
          ...prev[platform],
          [field]: field === "value" ? Number.parseFloat(val) || 0 : val,
        },
      };
      updateSettings({ platformCommissions: updated });
      return updated;
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={t.settings.title} onAvatarClick={onAvatarClick} />
      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Platform Commissions */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold mb-3">
            {t.settings.platformCommissions}
          </h3>

          <Select
            value={selectedCommissionPlatform}
            onValueChange={(v) => setSelectedCommissionPlatform(v as Platform)}
          >
            <SelectTrigger
              data-ocid="settings.platform.select"
              className="h-11 mb-3"
            >
              <SelectValue placeholder={t.addRide.platform} />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCommissionPlatform && (
            <div
              className="rounded-xl p-3 border space-y-3"
              style={{
                background: "oklch(0.58 0.21 264 / 0.06)",
                borderColor: "oklch(0.58 0.21 264 / 0.2)",
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: "oklch(0.65 0.15 264)" }}
              >
                {selectedCommissionPlatform}
              </p>
              <div>
                <Label className="text-xs">{t.settings.commissionType}</Label>
                <Select
                  value={platformCommissions[selectedCommissionPlatform].type}
                  onValueChange={(v) =>
                    updateCommission(
                      selectedCommissionPlatform,
                      "type",
                      v as CommissionType,
                    )
                  }
                >
                  <SelectTrigger
                    data-ocid="settings.commissiontype.select"
                    className="mt-1 h-10"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t.settings.noCommission}
                    </SelectItem>
                    <SelectItem value="percentage">
                      {t.settings.percentage}
                    </SelectItem>
                    <SelectItem value="fixed">{t.settings.fixed}</SelectItem>
                    <SelectItem value="daily_fee">
                      {t.settings.dailyFee}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {platformCommissions[selectedCommissionPlatform].type !==
                "none" && (
                <div>
                  <Label className="text-xs">
                    {t.settings.commissionValue}
                  </Label>
                  <Input
                    type="number"
                    value={String(
                      platformCommissions[selectedCommissionPlatform].value,
                    )}
                    onChange={(e) =>
                      updateCommission(
                        selectedCommissionPlatform,
                        "value",
                        e.target.value,
                      )
                    }
                    className="mt-1 h-10 text-sm"
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-3 space-y-1">
            {PLATFORMS.filter(
              (p) => platformCommissions[p].type !== "none",
            ).map((p) => (
              <div
                key={p}
                className="flex items-center justify-between text-xs py-1"
              >
                <span className="text-muted-foreground">{p}</span>
                <span className="font-medium">
                  {platformCommissions[p].type === "percentage"
                    ? `${platformCommissions[p].value}%`
                    : platformCommissions[p].type === "fixed"
                      ? `₹${platformCommissions[p].value} fixed`
                      : `₹${platformCommissions[p].value}/day`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fuel Settings */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <Label className="font-semibold font-display">
            {t.settings.fuelPrice}
          </Label>
          <Input
            data-ocid="settings.fuelprice.input"
            type="number"
            value={fuelPrice}
            onChange={(e) => {
              setFuelPrice(e.target.value);
              const val = Number.parseFloat(e.target.value);
              if (!Number.isNaN(val) && val > 0) {
                updateSettings({ fuelPricePerLitre: val });
              }
            }}
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
                ["bn", "বাংলা"],
                ["hi", "हिन्दी"],
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
                ["INR", "₹ INR"],
                ["BDT", "৳ BDT"],
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

        {/* App Preferences */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold mb-3">
            {t.settings.appPreferences}
          </h3>

          {/* Theme */}
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">
              {t.settings.appTheme}
            </Label>
            <div className="flex gap-2" data-ocid="settings.theme.toggle">
              {(["light", "dark"] as const).map((th) => (
                <button
                  type="button"
                  key={th}
                  onClick={() => onThemeChange?.(th)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize"
                  style={{
                    background:
                      appTheme === th
                        ? "oklch(0.58 0.21 264)"
                        : "oklch(var(--muted))",
                    color:
                      appTheme === th
                        ? "white"
                        : "oklch(var(--muted-foreground))",
                  }}
                >
                  {th === "light"
                    ? t.settings.lightTheme
                    : t.settings.darkTheme}
                </button>
              ))}
            </div>
          </div>

          {/* Sound */}
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">
              {t.settings.appSound}
            </Label>
            <div className="flex gap-2" data-ocid="settings.sound.toggle">
              {(["on", "off"] as const).map((s) => {
                const isOn = soundEnabled === (s === "on");
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      const newVal = s === "on";
                      setSoundEnabled(newVal);
                      localStorage.setItem(
                        "biju_sound_enabled",
                        String(newVal),
                      );
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all uppercase"
                    style={{
                      background: isOn
                        ? "oklch(0.65 0.15 142)"
                        : "oklch(var(--muted))",
                      color: isOn ? "white" : "oklch(var(--muted-foreground))",
                    }}
                  >
                    {s === "on" ? t.settings.soundOn : t.settings.soundOff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="font-medium text-sm">{t.settings.notifications}</p>
              <p className="text-xs text-muted-foreground">
                {t.settings.notificationsDesc}
              </p>
            </div>
            <button
              type="button"
              data-ocid="settings.notifications.toggle"
              onClick={() => {
                const newVal = !notificationsEnabled;
                setNotificationsEnabled(newVal);
                localStorage.setItem("biju_notifications", String(newVal));
              }}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                notificationsEnabled
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  notificationsEnabled ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold mb-2">
            {t.settings.about}
          </h3>
          <p className="text-sm font-semibold">Biju's RideBook v5.0</p>
          <p className="text-xs text-muted-foreground">
            {t.settings.appVersion}
          </p>
        </div>

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
