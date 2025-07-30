import { useEffect, useCallback } from "react";

const useKeyboardNavigation = ({
  onNext,
  onPrevious,
  onRandom,
  onFirst,
  onLast,
  onPronunciation,
  onMarkAsLearned,
  onMarkAsDifficult,
  onToggleFavorite,
  onToggleSearch,
  canGoNext = true,
  canGoPrevious = true,
  enabled = true,
}) => {
  const handleKeyPress = useCallback(
    (event) => {
      if (!enabled) return;

      // Prevent default behavior for navigation keys
      const navigationKeys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        " ",
        "Enter",
        "f",
        "F",
        "s",
        "S",
        "r",
        "R",
      ];

      if (navigationKeys.includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          if (canGoNext) {
            onNext?.();
          }
          break;

        case "ArrowLeft":
        case "ArrowUp":
          if (canGoPrevious) {
            onPrevious?.();
          }
          break;

        case "Home":
          onFirst?.();
          break;

        case "End":
          onLast?.();
          break;

        case " ":
        case "Enter":
          if (event.target.tagName === "BUTTON") {
            // Let the button handle its own click
            return;
          }
          onPronunciation?.();
          break;

        case "f":
        case "F":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onToggleSearch?.();
          }
          break;

        case "s":
        case "S":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onToggleSearch?.();
          }
          break;

        case "r":
        case "R":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onRandom?.();
          }
          break;

        default:
          break;
      }
    },
    [
      enabled,
      onNext,
      onPrevious,
      onRandom,
      onFirst,
      onLast,
      onPronunciation,
      onToggleSearch,
      canGoNext,
      canGoPrevious,
    ]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener("keydown", handleKeyPress);
      return () => {
        document.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [handleKeyPress, enabled]);

  // Return keyboard shortcuts info for screen readers
  const getKeyboardShortcuts = useCallback(
    () => ({
      next: "Arrow Right or Arrow Down",
      previous: "Arrow Left or Arrow Up",
      first: "Home",
      last: "End",
      pronunciation: "Space or Enter",
      search: "Ctrl/Cmd + F or Ctrl/Cmd + S",
      random: "Ctrl/Cmd + R",
    }),
    []
  );

  return {
    getKeyboardShortcuts,
  };
};

export default useKeyboardNavigation;
