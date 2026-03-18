import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import BottomNav, { type TabName } from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";
import TargetCelebration from "./components/TargetCelebration";
import AddRidePage from "./pages/AddRidePage";
import DriverProfilePage from "./pages/DriverProfilePage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { StoreProvider } from "./store/useStore";
import type { Ride } from "./store/useStore";

function shouldShowSplash(): boolean {
  const splashTs = sessionStorage.getItem("splashShownAt");
  if (!splashTs) return true;
  const elapsed = Date.now() - Number.parseInt(splashTs, 10);
  return elapsed > 30000;
}

function AppInner() {
  const [showSplash, setShowSplash] = useState(shouldShowSplash);
  const [activeTab, setActiveTab] = useState<TabName>(() => {
    const saved = localStorage.getItem("biju_last_tab") as TabName | null;
    const valid: TabName[] = [
      "home",
      "addRide",
      "history",
      "reports",
      "settings",
    ];
    return saved && valid.includes(saved) ? saved : "home";
  });
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [showDriverProfile, setShowDriverProfile] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [appTheme, setAppTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("biju_theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", appTheme === "dark");
    localStorage.setItem("biju_theme", appTheme);
  }, [appTheme]);

  const goToTab = (tab: TabName) => {
    setActiveTab(tab);
    localStorage.setItem("biju_last_tab", tab);
  };

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashShownAt", String(Date.now()));
    setShowSplash(false);
  };

  const handleEditRide = (ride: Ride) => {
    setEditingRide(ride);
    goToTab("addRide");
  };

  const handleRideSaved = () => {
    setEditingRide(null);
    goToTab("history");
  };

  const goToSettings = () => {
    setShowDriverProfile(false);
    goToTab("settings");
  };

  const goToDriverProfile = () => setShowDriverProfile(true);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Driver profile overlay (appears over everything except splash)
  if (showDriverProfile) {
    return (
      <div className="relative min-h-screen max-w-md mx-auto">
        <DriverProfilePage
          onBack={() => setShowDriverProfile(false)}
          onEditProfile={goToSettings}
        />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto">
      {activeTab === "home" && <HomePage onAvatarClick={goToDriverProfile} />}
      {activeTab === "addRide" && (
        <AddRidePage
          editRide={editingRide}
          onSaved={editingRide ? handleRideSaved : undefined}
          onAvatarClick={goToDriverProfile}
          onTargetReached={() => setShowCelebration(true)}
        />
      )}
      {activeTab === "history" && (
        <HistoryPage
          onEditRide={handleEditRide}
          onAvatarClick={goToDriverProfile}
        />
      )}
      {activeTab === "reports" && (
        <ReportsPage onAvatarClick={goToDriverProfile} />
      )}
      {activeTab === "settings" && (
        <SettingsPage
          onAvatarClick={goToDriverProfile}
          appTheme={appTheme}
          onThemeChange={setAppTheme}
        />
      )}
      <BottomNav
        active={activeTab}
        onTabChange={(tab) => {
          goToTab(tab);
          setEditingRide(null);
        }}
      />
      <Toaster position="top-center" richColors />
      {showCelebration && (
        <TargetCelebration onClose={() => setShowCelebration(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
