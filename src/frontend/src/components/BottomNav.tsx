import { BarChart2, Clock, Home, PlusCircle, Settings } from "lucide-react";
import { getTranslations } from "../i18n";
import { useStore } from "../store/useStore";

export type TabName = "home" | "addRide" | "history" | "reports" | "settings";

interface BottomNavProps {
  active: TabName;
  onTabChange: (tab: TabName) => void;
}

export default function BottomNav({ active, onTabChange }: BottomNavProps) {
  const { settings } = useStore();
  const t = getTranslations(settings.language);

  const tabs: {
    id: TabName;
    label: string;
    icon: React.ReactNode;
    ocid: string;
  }[] = [
    {
      id: "home",
      label: t.nav.home,
      icon: <Home size={20} />,
      ocid: "nav.home.link",
    },
    {
      id: "addRide",
      label: t.nav.addRide,
      icon: <PlusCircle size={20} />,
      ocid: "nav.addride.link",
    },
    {
      id: "history",
      label: t.nav.history,
      icon: <Clock size={20} />,
      ocid: "nav.history.link",
    },
    {
      id: "reports",
      label: t.nav.reports,
      icon: <BarChart2 size={20} />,
      ocid: "nav.reports.link",
    },
    {
      id: "settings",
      label: t.nav.settings,
      icon: <Settings size={20} />,
      ocid: "nav.settings.link",
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.17 0.04 264 / 0.0) 0%, oklch(0.17 0.04 264) 12px)",
        borderTop: "1px solid oklch(0.28 0.04 264)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        backgroundColor: "oklch(0.17 0.04 264 / 0.92)",
      }}
    >
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              data-ocid={tab.ocid}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 min-h-[58px] transition-colors"
            >
              {/* Icon pill bubble */}
              <div
                className="flex items-center justify-center w-10 h-6 rounded-full transition-all duration-200"
                style={{
                  background: isActive
                    ? "oklch(0.58 0.21 264 / 0.25)"
                    : "transparent",
                  color: isActive
                    ? "oklch(0.78 0.18 264)"
                    : "oklch(0.55 0.04 264)",
                }}
              >
                {tab.icon}
              </div>
              <span
                className="text-[11px] font-medium leading-none transition-colors"
                style={{
                  color: isActive
                    ? "oklch(0.78 0.18 264)"
                    : "oklch(0.55 0.04 264)",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
