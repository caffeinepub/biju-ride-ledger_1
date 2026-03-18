import { useEffect } from "react";

interface UseSwipeNavigationOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  elementRef?: React.RefObject<HTMLElement | null>;
}

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  elementRef,
}: UseSwipeNavigationOptions) {
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - startX;
      const deltaY = e.changedTouches[0].clientY - startY;

      // Only trigger if horizontal movement is dominant and significant
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    };

    const target = elementRef?.current ?? document;
    target.addEventListener("touchstart", handleTouchStart as EventListener, {
      passive: true,
    });
    target.addEventListener("touchend", handleTouchEnd as EventListener, {
      passive: true,
    });

    return () => {
      target.removeEventListener(
        "touchstart",
        handleTouchStart as EventListener,
      );
      target.removeEventListener("touchend", handleTouchEnd as EventListener);
    };
  }, [onSwipeLeft, onSwipeRight, elementRef]);
}
