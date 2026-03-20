import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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

  const isDarkMode = appTheme === "dark";

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
        {/* Language Dropdown */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold mb-3">
            {t.settings.language}
          </h3>
          <Select
            value={settings.language}
            onValueChange={(v) =>
              updateSettings({ language: v as "en" | "bn" | "hi" })
            }
          >
            <SelectTrigger
              data-ocid="settings.language.select"
              className="h-11 rounded-xl"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English (EN)</SelectItem>
              <SelectItem value="bn">বাংলা (BN)</SelectItem>
              <SelectItem value="hi">हिन्दी (HI)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Currency Dropdown */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold mb-3">
            {t.settings.currency}
          </h3>
          <Select
            value={settings.currency}
            onValueChange={(v) =>
              updateSettings({ currency: v as "INR" | "BDT" | "USD" })
            }
          >
            <SelectTrigger
              data-ocid="settings.currency.select"
              className="h-11 rounded-xl"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">₹ INR — Indian Rupee</SelectItem>
              <SelectItem value="BDT">৳ BDT — Bangladeshi Taka</SelectItem>
              <SelectItem value="USD">$ USD — US Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Default Fuel Type Dropdown */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold mb-3">
            {t.settings.fuelType || "Default Fuel Type"}
          </h3>
          <Select
            value={settings.defaultFuelType || "petrol"}
            onValueChange={(v) =>
              updateSettings({
                defaultFuelType: v as
                  | "petrol"
                  | "diesel"
                  | "cng"
                  | "electric"
                  | "hybrid",
              })
            }
          >
            <SelectTrigger
              data-ocid="settings.fueltype.select"
              className="h-11 rounded-xl"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">⛽ {t.fuel.petrol}</SelectItem>
              <SelectItem value="diesel">🛢️ {t.fuel.diesel}</SelectItem>
              <SelectItem value="cng">🟢 {t.fuel.cng}</SelectItem>
              <SelectItem value="electric">⚡ {t.fuel.electric}</SelectItem>
              <SelectItem value="hybrid">
                🔄 {t.fuel.hybrid || "Hybrid"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

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
                style={{ color: "oklch(0.55 0.18 264)" }}
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

        {/* Fuel Price */}
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

        {/* App Preferences */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display font-semibold mb-4">
            {t.settings.appPreferences}
          </h3>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-sm">{t.settings.appTheme}</p>
              <p className="text-xs text-muted-foreground">
                {isDarkMode ? t.settings.darkTheme : t.settings.lightTheme}
              </p>
            </div>
            <Switch
              data-ocid="settings.theme.toggle"
              checked={isDarkMode}
              onCheckedChange={(checked) =>
                onThemeChange?.(checked ? "dark" : "light")
              }
            />
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-sm">{t.settings.appSound}</p>
              <p className="text-xs text-muted-foreground">
                {soundEnabled ? t.settings.soundOn : t.settings.soundOff}
              </p>
            </div>
            <Switch
              data-ocid="settings.sound.toggle"
              checked={soundEnabled}
              onCheckedChange={(checked) => {
                setSoundEnabled(checked);
                localStorage.setItem("biju_sound_enabled", String(checked));
              }}
            />
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-sm">{t.settings.notifications}</p>
              <p className="text-xs text-muted-foreground">
                {t.settings.notificationsDesc}
              </p>
            </div>
            <Switch
              data-ocid="settings.notifications.toggle"
              checked={notificationsEnabled}
              onCheckedChange={(checked) => {
                setNotificationsEnabled(checked);
                localStorage.setItem("biju_notifications", String(checked));
              }}
            />
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
