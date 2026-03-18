import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStore } from "../store/useStore";

interface HeaderProps {
  title?: string;
  onAvatarClick?: () => void;
}

export default function Header({ title, onAvatarClick }: HeaderProps) {
  const { settings } = useStore();
  const initials = (settings.driverName || "DR")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
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
      {/* New Logo */}
      <div className="relative flex-shrink-0">
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40"
          style={{ background: "oklch(0.72 0.19 47)" }}
        />
        <img
          src="/assets/uploads/file_00000000154071faaeaf583d8d2945a9-1.png"
          alt="Biju's RideBook Logo"
          className="relative h-9 w-9 object-contain drop-shadow-lg rounded-full"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold font-display leading-tight tracking-tight text-white">
          Biju's RideBook
        </h1>
        {title && (
          <p
            className="text-[11px] leading-none mt-0.5 font-medium uppercase tracking-widest"
            style={{ color: "oklch(0.72 0.19 47)" }}
          >
            {title}
          </p>
        )}
      </div>

      {/* Driver Avatar */}
      <button
        type="button"
        data-ocid="header.avatar.button"
        onClick={onAvatarClick}
        className="flex-shrink-0 rounded-full ring-2 ring-white/20 hover:ring-white/40 transition-all active:scale-95"
        aria-label="Open Profile"
      >
        <Avatar className="w-9 h-9">
          <AvatarImage src={settings.profilePicture || undefined} />
          <AvatarFallback
            className="text-sm font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.58 0.21 264), oklch(0.72 0.19 47))",
              color: "white",
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>
    </header>
  );
}
