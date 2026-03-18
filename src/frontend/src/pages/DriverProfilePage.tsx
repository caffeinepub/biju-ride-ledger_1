import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit2,
  MapPin,
  Save,
  Target,
  Truck,
  User,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useStore } from "../store/useStore";

interface DriverProfilePageProps {
  onBack: () => void;
  onEditProfile?: () => void;
}

export default function DriverProfilePage({ onBack }: DriverProfilePageProps) {
  const { settings, updateSettings } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Local edit state
  const [editName, setEditName] = useState(settings.driverName || "");
  const [editVehicle, setEditVehicle] = useState(
    settings.vehicleType || "Bike",
  );
  const [editCity, setEditCity] = useState(settings.city || "");
  const [editTarget, setEditTarget] = useState(
    String(settings.dailyTarget || 1000),
  );

  const initials = (settings.driverName || "DR")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handlePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      updateSettings({ profilePicture: result });
      toast.success("Profile photo updated!");
    };
    reader.readAsDataURL(file);
    setShowPhotoOptions(false);
  };

  const startEditing = () => {
    setEditName(settings.driverName || "");
    setEditVehicle(settings.vehicleType || "Bike");
    setEditCity(settings.city || "");
    setEditTarget(String(settings.dailyTarget || 1000));
    setIsEditing(true);
  };

  const saveProfile = () => {
    updateSettings({
      driverName: editName.trim() || settings.driverName,
      vehicleType: editVehicle as any,
      city: editCity.trim(),
      dailyTarget: Number(editTarget) || settings.dailyTarget,
    });
    setIsEditing(false);
    toast.success("Profile saved!");
  };

  // ─── Stats computed from localStorage ───
  const allRides = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("biju_rides") || "[]");
    } catch {
      return [];
    }
  }, []);

  const allShifts = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("biju_shifts") || "[]");
    } catch {
      return [];
    }
  }, []);

  const totalRides = allRides.length;
  const totalKM = useMemo(
    () =>
      allRides.reduce(
        (sum: number, r: any) =>
          sum +
          (Number.parseFloat(r.ride_km) || Number.parseFloat(r.distance) || 0),
        0,
      ),
    [allRides],
  );

  const bestDayEarnings = useMemo(() => {
    const byDate: Record<string, number> = {};
    for (const r of allRides) {
      const d = r.ride_date || r.datetime?.split("T")[0] || "";
      if (!d) continue;
      byDate[d] =
        (byDate[d] || 0) +
        (Number.parseFloat(r.netIncome) || Number.parseFloat(r.fare) || 0);
    }
    const vals = Object.values(byDate) as number[];
    return vals.length > 0 ? Math.max(0, ...vals) : 0;
  }, [allRides]);

  const streak = useMemo(() => {
    const shiftDates = new Set<string>(
      allShifts
        .filter(
          (s: any) =>
            s.status === "STARTED" ||
            s.status === "COMPLETED" ||
            s.active === false ||
            s.active === true,
        )
        .map((s: any) => s.date as string)
        .filter(Boolean),
    );
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (shiftDates.has(dateStr)) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [allShifts]);

  const achievementBadge =
    totalRides >= 500
      ? "🏆 500 Rides Legend"
      : totalRides >= 100
        ? "⭐ 100 Rides Pro"
        : totalRides >= 50
          ? "🥈 50 Rides Star"
          : totalRides >= 10
            ? "🥉 10 Rides Starter"
            : "🚗 New Driver";

  const motivations = [
    "Every kilometer brings you closer to your goal. Keep driving!",
    "Your consistency today builds tomorrow's success.",
    "Hard work on the road pays off. You're doing great!",
    "Each ride is a step forward. Stay focused!",
    "The best drivers aren't born — they're built ride by ride.",
    "Your dedication inspires others. Keep going!",
    "Small progress every day adds up to big results.",
    "Proud of your hustle. Today is another winning day!",
    "Stay safe, stay focused, and earn well today!",
    "Your road to financial freedom is one ride at a time.",
  ];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  const todayMotivation = motivations[dayOfYear % motivations.length];

  const [drivingSince, setDrivingSince] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem("biju_settings") || "{}");
      return s.drivingSince || "";
    } catch {
      return "";
    }
  });

  const saveDrivingSince = (year: string) => {
    setDrivingSince(year);
    try {
      const s = JSON.parse(localStorage.getItem("biju_settings") || "{}");
      s.drivingSince = year;
      localStorage.setItem("biju_settings", JSON.stringify(s));
    } catch {}
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground";
  const labelClass = "text-xs font-medium text-muted-foreground block mb-1";

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Custom header */}
      <header
        className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 safe-top"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.17 0.05 264) 0%, oklch(0.22 0.08 264) 100%)",
          borderBottom: "1px solid oklch(0.72 0.19 47 / 0.35)",
          boxShadow:
            "0 1px 0 oklch(0.58 0.21 264 / 0.2), 0 4px 16px -2px oklch(0.14 0.04 264 / 0.8)",
        }}
      >
        <button
          type="button"
          data-ocid="profile.back.button"
          onClick={onBack}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: "oklch(1 0 0 / 0.08)" }}
          aria-label="Go back"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-bold font-display leading-tight tracking-tight text-white">
            Driver Profile
          </h1>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={startEditing}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all active:scale-95"
            style={{
              background: "oklch(0.58 0.21 264 / 0.5)",
              border: "1px solid oklch(1 0 0 / 0.2)",
            }}
          >
            <Edit2 size={12} />
            Edit
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
            aria-label="Cancel editing"
          >
            <X size={16} />
          </button>
        )}
      </header>

      {/* Photo options overlay */}
      {showPhotoOptions && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowPhotoOptions(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowPhotoOptions(false)}
          aria-label="Close photo options"
          tabIndex={-1}
        >
          <div
            className="rounded-t-2xl p-5 space-y-3 safe-bottom"
            style={{ background: "var(--background, white)" }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Change Profile Photo
            </p>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{
                background: "oklch(0.58 0.21 264 / 0.12)",
                color: "oklch(0.45 0.18 264)",
              }}
              onClick={() => cameraInputRef.current?.click()}
            >
              <span className="text-xl">📷</span>
              Take Photo (Camera)
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{
                background: "oklch(0.72 0.19 47 / 0.12)",
                color: "oklch(0.50 0.16 47)",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-xl">🖼️</span>
              Choose from Gallery
            </button>
            <button
              type="button"
              className="w-full py-3 rounded-xl text-sm font-medium text-muted-foreground transition-all active:scale-[0.98] border border-border"
              onClick={() => setShowPhotoOptions(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePicture}
        data-ocid="profile.photo.gallery.input"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePicture}
        data-ocid="profile.photo.camera.input"
      />

      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Avatar section */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 ring-white/20">
              <AvatarImage src={settings.profilePicture || undefined} />
              <AvatarFallback
                className="text-3xl font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.58 0.21 264), oklch(0.72 0.19 47))",
                  color: "white",
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              data-ocid="profile.upload_button"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ background: "oklch(0.72 0.19 47)" }}
              onClick={() => setShowPhotoOptions(true)}
              aria-label="Change photo"
            >
              <Edit2 size={14} className="text-white" />
            </button>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold font-display text-foreground">
              {settings.driverName || "Driver"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {settings.vehicleType} · {settings.city || "City not set"}
            </p>
          </div>
        </div>

        {/* Profile info / edit section */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {!isEditing ? (
            /* Read-only rows */
            <>
              {[
                {
                  icon: User,
                  label: "Name",
                  value: settings.driverName || "Not set",
                },
                {
                  icon: Truck,
                  label: "Vehicle Type",
                  value: settings.vehicleType || "Not set",
                },
                {
                  icon: MapPin,
                  label: "City",
                  value: settings.city || "Not set",
                },
                {
                  icon: Target,
                  label: "Daily Target",
                  value: `₹${settings.dailyTarget.toLocaleString()}`,
                },
              ].map((row, idx, arr) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    data-ocid={`profile.info.item.${idx + 1}`}
                    className="flex items-center gap-4 px-4 py-4"
                    style={{
                      borderBottom:
                        idx < arr.length - 1
                          ? "1px solid oklch(var(--border))"
                          : undefined,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "oklch(0.58 0.21 264 / 0.15)" }}
                    >
                      <Icon
                        size={16}
                        style={{ color: "oklch(0.72 0.19 47)" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {row.label}
                      </p>
                      <p className="font-semibold text-sm mt-0.5 truncate text-foreground">
                        {row.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            /* Editable fields */
            <div className="p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Edit Profile
              </p>

              <div>
                <label className={labelClass} htmlFor="edit-name">
                  Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="edit-vehicle">
                  Vehicle Type
                </label>
                <select
                  id="edit-vehicle"
                  value={editVehicle}
                  onChange={(e) => setEditVehicle(e.target.value as any)}
                  className={inputClass}
                >
                  <option value="Bike">Bike</option>
                  <option value="Car">Car</option>
                  <option value="Auto">Auto</option>
                  <option value="Toto">Toto</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="edit-city">
                  City
                </label>
                <input
                  id="edit-city"
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="Your city"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="edit-target">
                  Daily Target (₹)
                </label>
                <input
                  id="edit-target"
                  type="number"
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  placeholder="e.g. 1500"
                  className={inputClass}
                  min="0"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 gap-2 text-white font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.58 0.21 264), oklch(0.72 0.19 47))",
                  }}
                  onClick={saveProfile}
                  data-ocid="profile.save_button"
                >
                  <Save size={16} />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="rounded-2xl bg-card border border-border p-4 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Your Stats
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalRides}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Rides</p>
            </div>
            <div className="rounded-xl bg-green-50 dark:bg-green-950/30 p-3 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalKM.toFixed(0)} km
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total KM Driven
              </p>
            </div>
            <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 p-3 text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ₹{bestDayEarnings.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Best Day Earnings
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 p-3 text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {streak} 🔥
              </p>
              <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
            </div>
          </div>

          {/* Achievement Badge */}
          <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 text-center">
            <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
              {achievementBadge}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Achievement</p>
          </div>

          {/* Driving Since */}
          <div>
            <label
              htmlFor="driving-since"
              className="text-xs font-medium text-muted-foreground block mb-1"
            >
              Driving Since (Year)
            </label>
            <input
              type="number"
              min="2010"
              max={new Date().getFullYear()}
              value={drivingSince}
              onChange={(e) => saveDrivingSince(e.target.value)}
              placeholder="e.g. 2020"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
              id="driving-since"
              data-ocid="profile.driving_since.input"
            />
          </div>
        </div>

        {/* Today's Motivation */}
        <div
          className="rounded-2xl border border-border p-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.58 0.21 264 / 0.08), oklch(0.72 0.19 47 / 0.08))",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Today's Motivation
          </p>
          <p className="text-sm font-medium leading-relaxed text-blue-800 dark:text-blue-100 motivation-text">
            {todayMotivation}
          </p>
        </div>
      </main>
    </div>
  );
}
