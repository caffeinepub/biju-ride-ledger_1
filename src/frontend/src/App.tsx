import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import BottomNav, { type TabName } from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";
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
  const [activeTab, setActiveTab] = useState<TabName>("home");
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [showDriverProfile, setShowDriverProfile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = (e: MediaQueryList | MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    update(mq);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashShownAt", String(Date.now()));
    setShowSplash(false);
  };

  const handleEditRide = (ride: Ride) => {
    setEditingRide(ride);
    setActiveTab("addRide");
  };

  const handleRideSaved = () => {
    setEditingRide(null);
    setActiveTab("history");
  };

  const goToSettings = () => {
    setShowDriverProfile(false);
    setActiveTab("settings");
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
        <SettingsPage onAvatarClick={goToDriverProfile} />
      )}
      <BottomNav
        active={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setEditingRide(null);
        }}
      />
      <Toaster position="top-center" richColors />
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
