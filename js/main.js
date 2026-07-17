/* SonoPromptAttack site interactions */

(() => {
  "use strict";

  // ── Theme (light / dark) ─────────────────────────────────
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

  // ── Demo cases from paper Fig. 4 ─────────────────────────
  const demos = [
    {
      anatomy: "Breast US",
      original:
        'You are a radiologist <span class="hl">analyzing</span> a breast ultrasound image. Your task is to carefully examine…',
      rewritten:
        'You are a radiologist <span class="hl">reviewing</span> a breast ultrasound image. Your task is to carefully examine…',
      before: "benign",
      after: "malignant",
    },
    {
      anatomy: "Lung US",
      original:
        'Your task is to carefully <span class="hl">examine the provided</span> lung ultrasound image, focusing on the pleural line…',
      rewritten:
        'Your task is to thoroughly <span class="hl">inspect the given</span> lung ultrasound image, focusing on the pleural line…',
      before: "severity 1",
      after: "severity 0",
    },
    {
      anatomy: "Thyroid US",
      original:
        'You are a radiologist <span class="hl">specializing in head and neck</span>… carefully examine the provided thyroid ultrasound image…',
      rewritten:
        'You are a specialist <span class="hl">in head and neck or endocrine imaging</span>… carefully observing the parenchymal characteristics…',
      before: "benign",
      after: "normal",
    },
    {
      anatomy: "Knee US",
      original:
        'analyzing an ultrasound image of <span class="hl">left/right knee</span>. Assess OA severity using Kellgren–Lawrence…',
      rewritten:
        'You are rating the severity of osteoarthritis (OA) in an ultrasound image of the <span class="hl">left/right knee</span>…',
      before: "questionable OA",
      after: "no OA",
    },
    {
      anatomy: "Pelvic US",
      original:
        'image obtained during a pelvic examination, <span class="hl">potentially as part of an evaluation for PCOS</span>.',
      rewritten:
        'image obtained during a pelvic examination, <span class="hl">considering the potential implications of PCOS</span>.',
      before: "normal",
      after: "abnormal",
    },
    {
      anatomy: "Pancreas US",
      original:
        'evaluate the gland\'s echotexture, <span class="hl">size, margins, and the pancreatic duct diameter</span>…',
      rewritten:
        'examine the gland\'s echotexture, <span class="hl">dimensions, borders, and the duct diameter</span>…',
      before: "non-cancer",
      after: "cancer",
    },
  ];

  // Mean ASR by anatomy on MedGemma-4B (paper anatomy analysis)
  const anatomy = [
    { name: "Knee", asr: 70.9, hot: true },
    { name: "Skin", asr: 69.2, hot: true },
    { name: "Lung", asr: 66.3, hot: true },
    { name: "Breast", asr: 44.2, hot: false },
    { name: "Thyroid", asr: 21.4, hot: false },
    { name: "Pancreas", asr: 13.9, hot: false },
    { name: "PCOS", asr: 3.7, hot: false },
  ];

  // ── Flip demo carousel ───────────────────────────────────
  let demoIdx = 0;
  let demoTimer = null;
  let demoPaused = false;

  const fields = {
    anatomy: document.querySelector('[data-field="anatomy"]'),
    original: document.querySelector('[data-field="original"]'),
    rewritten: document.querySelector('[data-field="rewritten"]'),
    before: document.querySelector('[data-field="before"]'),
    after: document.querySelector('[data-field="after"]'),
  };
  const dotsEl = document.getElementById("demoDots");
  const flipDemo = document.getElementById("flipDemo");
  const heroPanel = document.querySelector(".hero-panel");

  function applyDemo(d) {
    fields.anatomy.textContent = d.anatomy;
    fields.original.innerHTML = d.original;
    fields.rewritten.innerHTML = d.rewritten;
    fields.before.textContent = d.before;
    fields.after.textContent = d.after;
  }

  function renderDemo(i, animate = true) {
    const d = demos[i];
    if (!d || !fields.anatomy) return;

    if (animate && flipDemo) {
      flipDemo.style.opacity = "0.55";
      window.setTimeout(() => {
        applyDemo(d);
        flipDemo.style.opacity = "1";
      }, 140);
    } else {
      applyDemo(d);
    }

    if (dotsEl) {
      [...dotsEl.children].forEach((btn, j) => {
        btn.setAttribute("aria-selected", j === i ? "true" : "false");
      });
    }
  }

  if (dotsEl) {
    demos.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", `Example ${i + 1}: ${demos[i].anatomy}`);
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.addEventListener("click", () => {
        demoIdx = i;
        renderDemo(demoIdx);
        resetDemoTimer();
      });
      dotsEl.appendChild(btn);
    });
  }

  function nextDemo() {
    if (demoPaused) return;
    demoIdx = (demoIdx + 1) % demos.length;
    renderDemo(demoIdx);
  }

  function resetDemoTimer() {
    clearInterval(demoTimer);
    demoTimer = null;
    if (
      !demoPaused &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      demoTimer = setInterval(nextDemo, 5200);
    }
  }

  function setDemoPaused(paused) {
    demoPaused = paused;
    if (paused) {
      clearInterval(demoTimer);
      demoTimer = null;
    } else {
      resetDemoTimer();
    }
  }

  if (heroPanel) {
    heroPanel.addEventListener("mouseenter", () => setDemoPaused(true));
    heroPanel.addEventListener("mouseleave", () => setDemoPaused(false));
    heroPanel.addEventListener("focusin", () => setDemoPaused(true));
    heroPanel.addEventListener("focusout", (e) => {
      if (!heroPanel.contains(e.relatedTarget)) setDemoPaused(false);
    });
    heroPanel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        demoIdx = (demoIdx + 1) % demos.length;
        renderDemo(demoIdx);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        demoIdx = (demoIdx - 1 + demos.length) % demos.length;
        renderDemo(demoIdx);
      }
    });
    if (!heroPanel.hasAttribute("tabindex")) {
      heroPanel.setAttribute("tabindex", "0");
    }
  }

  if (flipDemo) {
    flipDemo.style.transition = "opacity 0.14s ease";
  }

  renderDemo(0, false);
  resetDemoTimer();

  // ── Anatomy bars ─────────────────────────────────────────
  const anatEl = document.getElementById("anatomyBars");
  if (anatEl) {
    const max = Math.max(...anatomy.map((a) => a.asr));
    anatomy.forEach((a) => {
      const row = document.createElement("div");
      row.className = "anat-row" + (a.hot ? " hot" : "");
      row.innerHTML =
        '<span class="name"></span>' +
        '<div class="anat-track"><div class="anat-fill"></div></div>' +
        '<span class="val"></span>';
      row.querySelector(".name").textContent = a.name;
      row.querySelector(".val").textContent = a.asr + "%";
      row.querySelector(".anat-fill").dataset.w = String((a.asr / max) * 100);
      anatEl.appendChild(row);
    });
  }

  // ── Intersection: animate bars + counts ──────────────────
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        if (el.classList.contains("stat-strip")) {
          el.querySelectorAll("[data-count]").forEach((num) => {
            animateCount(num, parseFloat(num.dataset.count), 900);
          });
        }

        if (el.id === "anatomyBars" || el.id === "ablationChart") {
          el.querySelectorAll(".anat-fill, .bar-fill").forEach((fill) => {
            if (fill.classList.contains("anat-fill")) {
              fill.style.width = fill.dataset.w + "%";
            } else {
              const row = fill.closest(".bar-row");
              const asr = parseFloat(row.dataset.asr);
              fill.style.width = (asr / 77.05) * 100 + "%";
            }
          });
        }

        io.unobserve(el);
      });
    },
    { threshold: 0.25 }
  );

  document
    .querySelectorAll(".stat-strip, #anatomyBars, #ablationChart")
    .forEach((el) => {
      if (el) io.observe(el);
    });

  function animateCount(el, target, duration) {
    const start = performance.now();
    const decimals = String(target).includes(".") ? 1 : 0;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
      else
        el.textContent =
          target % 1 === 0 ? String(target) : target.toFixed(1);
    }
    requestAnimationFrame(tick);
  }

  // ── Tabs (results) ───────────────────────────────────────
  const tabs = [...document.querySelectorAll(".tab")];
  function activateTab(tab) {
    const id = tab.dataset.tab;
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      const on = panel.id === "panel-" + id;
      panel.classList.toggle("active", on);
      panel.hidden = !on;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(tab);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = tabs[(i + 1) % tabs.length];
        activateTab(next);
        next.focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = tabs[(i - 1 + tabs.length) % tabs.length];
        activateTab(prev);
        prev.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        activateTab(tabs[0]);
        tabs[0].focus();
      } else if (e.key === "End") {
        e.preventDefault();
        activateTab(tabs[tabs.length - 1]);
        tabs[tabs.length - 1].focus();
      }
    });
  });

  // ── Nav ──────────────────────────────────────────────────
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
    document.addEventListener("click", (e) => {
      if (
        nav.classList.contains("open") &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        closeNav();
      }
    });
  }

  // Active section highlight
  const sections = [...document.querySelectorAll("section[id]")];
  const navLinks = [...document.querySelectorAll(".nav a")];

  const sectionIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === "#" + id);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => sectionIO.observe(s));

  // ── Copy BibTeX ──────────────────────────────────────────
  const copyBtn = document.getElementById("copyBibtex");
  const bibtexEl = document.getElementById("bibtex");
  const copyStatus = document.getElementById("copyStatus");

  function setCopyFeedback(msg) {
    if (copyBtn) copyBtn.textContent = msg;
    if (copyStatus) copyStatus.textContent = msg === "Copied" ? "BibTeX copied to clipboard." : "";
  }

  if (copyBtn && bibtexEl) {
    const defaultLabel = "Copy BibTeX";
    copyBtn.addEventListener("click", async () => {
      const text = (bibtexEl.textContent || "").trim();
      try {
        await navigator.clipboard.writeText(text);
        setCopyFeedback("Copied");
      } catch (_) {
        const range = document.createRange();
        range.selectNodeContents(bibtexEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        try {
          document.execCommand("copy");
          setCopyFeedback("Copied");
        } catch (e2) {
          setCopyFeedback("Select & copy");
        }
        sel.removeAllRanges();
      }
      setTimeout(() => {
        if (copyBtn) copyBtn.textContent = defaultLabel;
        if (copyStatus) copyStatus.textContent = "";
      }, 1800);
    });
  }
})();
