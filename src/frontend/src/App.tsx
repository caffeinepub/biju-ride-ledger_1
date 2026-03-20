import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import BottomNav, { type TabName } from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";
import TargetCelebration from "./components/TargetCelebration";
import { useSwipeNavigation } from "./hooks/useSwipeNavigation";
import AddRidePage from "./pages/AddRidePage";
import DriverProfilePage from "./pages/DriverProfilePage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { StoreProvider } from "./store/useStore";
import type { Ride } from "./store/useStore";

const TAB_ORDER: TabName[] = [
  "home",
  "addRide",
  "history",
  "reports",
  "settings",
];

function shouldShowSplash(): boolean {
  const splashTs = sessionStorage.getItem("splashShownAt");
  if (!splashTs) return true;
  const elapsed = Date.now() - Number.parseInt(splashTs, 10);
  return elapsed > 30000;
}

// Push a state so there is always at least one entry in browser history
function pushAppState(tab?: string) {
  window.history.pushState(
    { app: true, tab: tab ?? "home" },
    "",
    window.location.href,
  );
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [appTheme, setAppTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("biju_theme") as "light" | "dark") || "light";
  });

  // Internal navigation stack — source of truth, never depends on browser
  const navStackRef = useRef<TabName[]>([]);
  // Refs so popstate handler always reads current values with no stale closure
  const activeTabRef = useRef<TabName>(activeTab);
  const showDriverProfileRef = useRef<boolean>(false);
  const showExitConfirmRef = useRef<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    showDriverProfileRef.current = showDriverProfile;
  }, [showDriverProfile]);

  useEffect(() => {
    showExitConfirmRef.current = showExitConfirm;
  }, [showExitConfirm]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", appTheme === "dark");
    localStorage.setItem("biju_theme", appTheme);
  }, [appTheme]);

  // Low-level navigate — updates state + ref + localStorage + browser history
  const navigateTo = useCallback((tab: TabName) => {
    activeTabRef.current = tab;
    setActiveTab(tab);
    localStorage.setItem("biju_last_tab", tab);
    // Push a browser history entry so every tab switch is trackable
    pushAppState(tab);
  }, []);

  // handleBack — fully internal, never relies on browser state
  const handleBack = useCallback(() => {
    // If exit confirm is showing, dismiss it first
    if (showExitConfirmRef.current) {
      setShowExitConfirm(false);
      return;
    }

    // If driver profile overlay is open, close it
    if (showDriverProfileRef.current) {
      setShowDriverProfile(false);
      return;
    }

    if (navStackRef.current.length > 0) {
      const stack = navStackRef.current;
      const prevTab = stack[stack.length - 1];
      navStackRef.current = stack.slice(0, -1);
      // navigateTo pushes a new browser state — that's fine, we want the stack full
      navigateTo(prevTab);
      return;
    }

    // Stack empty — only show exit on Dashboard, otherwise go home
    if (activeTabRef.current === "home") {
      setShowExitConfirm(true);
    } else {
      navigateTo("home");
    }
  }, [navigateTo]);

  // Keep a stable ref so the once-registered popstate can always call latest handleBack
  const handleBackRef = useRef(handleBack);
  handleBackRef.current = handleBack;

  // Register popstate ONCE on mount.
  // Strategy: always push a fresh state after every popstate so the browser
  // history stack never empties — Chrome can never navigate away on its own.
  useEffect(() => {
    // Seed two entries so there is always a buffer even after one pop
    pushAppState("home");
    pushAppState("home");

    const onPopState = () => {
      // Immediately push state back — replenish the buffer before anything else
      pushAppState(activeTabRef.current);
      // Now let our internal logic decide what to show
      handleBackRef.current();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Navigate to a new tab, pushing current onto the internal stack
  const goToTab = useCallback(
    (tab: TabName) => {
      navStackRef.current = [...navStackRef.current, activeTabRef.current];
      navigateTo(tab);
    },
    [navigateTo],
  );

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

  const handleSwipeLeft = useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTabRef.current);
    if (currentIndex < TAB_ORDER.length - 1) {
      goToTab(TAB_ORDER[currentIndex + 1]);
    }
  }, [goToTab]);

  const handleSwipeRight = useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTabRef.current);
    if (currentIndex > 0) {
      goToTab(TAB_ORDER[currentIndex - 1]);
    }
  }, [goToTab]);

  useSwipeNavigation({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    elementRef: contentRef,
  });

  const handleExitApp = () => {
    setShowExitConfirm(false);
    // Best-effort PWA close
    window.close();
    setTimeout(() => {
      try {
        // Fallback: navigate to blank
        window.location.href = "about:blank";
      } catch (_) {}
    }, 300);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

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
    <div ref={contentRef} className="relative min-h-screen max-w-md mx-auto">
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

      {showExitConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowExitConfirm(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowExitConfirm(false)}
          tabIndex={-1}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Exit App?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to exit Biju's RideBook?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300"
                onClick={() => setShowExitConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold"
                onClick={handleExitApp}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
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
