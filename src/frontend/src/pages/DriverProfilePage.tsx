import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, MapPin, Target, Truck, User } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { useStore } from "../store/useStore";

interface DriverProfilePageProps {
  onBack: () => void;
  onEditProfile: () => void;
}

export default function DriverProfilePage({
  onBack,
  onEditProfile,
}: DriverProfilePageProps) {
  const { settings, updateSettings } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  const rows = [
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
  ];

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
      </header>

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
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change photo"
            >
              <Edit2 size={14} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePicture}
              data-ocid="profile.photo.input"
            />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold font-display">
              {settings.driverName || "Driver"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {settings.vehicleType} · {settings.city || "City not set"}
            </p>
          </div>
        </div>

        {/* Profile info rows */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {rows.map((row, idx) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                data-ocid={`profile.info.item.${idx + 1}`}
                className="flex items-center gap-4 px-4 py-4"
                style={{
                  borderBottom:
                    idx < rows.length - 1
                      ? "1px solid oklch(var(--border))"
                      : undefined,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.58 0.21 264 / 0.15)" }}
                >
                  <Icon size={16} style={{ color: "oklch(0.72 0.19 47)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className="font-semibold text-sm mt-0.5 truncate">
                    {row.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit button */}
        <Button
          data-ocid="profile.edit.button"
          className="w-full h-14 rounded-xl text-base font-bold gap-2 text-white"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.58 0.21 264), oklch(0.72 0.19 47))",
            boxShadow: "0 4px 20px -4px oklch(0.65 0.20 264 / 0.5)",
          }}
          onClick={onEditProfile}
        >
          <Edit2 size={18} />
          Edit Profile
        </Button>
      </main>
    </div>
  );
}
