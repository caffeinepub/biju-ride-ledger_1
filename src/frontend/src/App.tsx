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

  // Navigation history stack for proper back button behavior
  const navHistoryRef = useRef<TabName[]>([]);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", appTheme === "dark");
    localStorage.setItem("biju_theme", appTheme);
  }, [appTheme]);

  // Push initial state so we can catch popstate
  useEffect(() => {
    history.pushState({ biju: true }, "", window.location.href);

    const handlePopState = () => {
      if (showDriverProfile) {
        setShowDriverProfile(false);
        history.pushState({ biju: true }, "", window.location.href);
        return;
      }
      // Pop from our navigation history stack
      const stack = navHistoryRef.current;
      if (stack.length > 0) {
        const prevTab = stack[stack.length - 1];
        navHistoryRef.current = stack.slice(0, -1);
        setActiveTab(prevTab);
        localStorage.setItem("biju_last_tab", prevTab);
        history.pushState({ biju: true }, "", window.location.href);
      } else {
        // Stack is empty — we're at the root, show exit confirm
        setShowExitConfirm(true);
        history.pushState({ biju: true }, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showDriverProfile]);

  const goToTab = useCallback(
    (tab: TabName) => {
      // Push current tab onto history stack before switching
      navHistoryRef.current = [...navHistoryRef.current, activeTab];
      setActiveTab(tab);
      localStorage.setItem("biju_last_tab", tab);
    },
    [activeTab],
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

  // Swipe navigation
  const handleSwipeLeft = useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (currentIndex < TAB_ORDER.length - 1) {
      goToTab(TAB_ORDER[currentIndex + 1]);
    }
  }, [activeTab, goToTab]);

  const handleSwipeRight = useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (currentIndex > 0) {
      goToTab(TAB_ORDER[currentIndex - 1]);
    }
  }, [activeTab, goToTab]);

  useSwipeNavigation({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    elementRef: contentRef,
  });

  const handleExitApp = () => {
    setShowExitConfirm(false);
    // Try window.close() first — works in PWA standalone mode
    window.close();
    // If still open after 300ms, navigate history back as far as possible
    setTimeout(() => {
      try {
        window.history.go(-window.history.length);
      } catch (_) {}
      // Final fallback
      setTimeout(() => {
        window.location.href = "about:blank";
      }, 300);
    }, 300);
  };

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

      {/* Exit App Confirmation Dialog */}
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
            data-ocid="exit.dialog"
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
                data-ocid="exit.cancel_button"
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300"
                onClick={() => setShowExitConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="exit.confirm_button"
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
