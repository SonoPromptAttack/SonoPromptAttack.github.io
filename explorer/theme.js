(() => {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const THEME_KEY = "sono-theme";
  const THEME_COLORS = { dark: "#070b10", light: "#f2f5f8" };

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function syncThemeColor(theme) {
    let meta = document.querySelector('meta[name="theme-color"][data-dynamic]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      meta.setAttribute("data-dynamic", "1");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", THEME_COLORS[theme] || THEME_COLORS.dark);
  }

  function applyTheme(theme, { persist = false } = {}) {
    const next = theme === "light" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    syncThemeColor(next);
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (_) {
        /* private mode */
      }
    }
    if (themeToggle) {
      const toLight = next === "dark";
      themeToggle.setAttribute(
        "aria-label",
        toLight ? "Switch to light mode" : "Switch to dark mode"
      );
      themeToggle.title = toLight ? "Light mode" : "Dark mode";
    }
  }

  applyTheme(currentTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      applyTheme(currentTheme() === "dark" ? "light" : "dark", { persist: true });
    });
  }

  try {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? "light" : "dark");
      }
    });
  } catch (_) {
    /* ignore */
  }
})();
