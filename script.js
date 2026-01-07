(() => {
  const THEME_KEY = "portfolio-theme";
  const EMAIL =
    document
      .querySelector('a[href^="mailto:"]')
      ?.getAttribute("href")
      ?.replace("mailto:", "") ?? "you@example.com";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const root = document.documentElement;
  const header = $("[data-header]");
  const nav = $("[data-nav]");
  const menuToggle = $("[data-menu-toggle]");
  const themeToggle = $("[data-theme-toggle]");

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.left = "-1000px";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let ok = false;
    try {
      ok = document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }

    return ok;
  };

  const applyTheme = (theme) => {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }

    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  };

  const getPreferredTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;

    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const toggleTheme = () => {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  };

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  const setNavOpen = (open) => {
    if (!header || !menuToggle) return;

    header.classList.toggle("nav-open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const open = header?.classList.contains("nav-open");
      setNavOpen(!open);
    });
  }

  // Close mobile menu when a nav link is selected.
  if (nav) {
    nav.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("a")) return;
      setNavOpen(false);
    });
  }

  // Close mobile menu when clicking outside.
  document.addEventListener("click", (event) => {
    if (!header) return;
    if (!header.classList.contains("nav-open")) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const clickedInsideHeader = target.closest("[data-header]");
    if (!clickedInsideHeader) {
      setNavOpen(false);
    }
  });

  // Close on ESC.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setNavOpen(false);
  });

  // Reveal on scroll.
  const revealTargets = $$(".reveal");
  if (revealTargets.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  const skillsSection = $("#skills");
  if (skillsSection && "IntersectionObserver" in window) {
    const skillsObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          skillsSection.classList.add("skills-animate");
          skillsObserver.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    skillsObserver.observe(skillsSection);
  } else if (skillsSection) {
    skillsSection.classList.add("skills-animate");
  }

  // Footer year.
  const yearEl = $("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Copy email button.
  const copyButton = $("[data-copy-email]");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const original = copyButton.textContent;

      try {
        const ok = await copyText(EMAIL);
        if (!ok) throw new Error("Copy failed");
        copyButton.textContent = "Copied!";
      } catch {
        copyButton.textContent = "Copy failed";
      }

      window.setTimeout(() => {
        copyButton.textContent = original;
      }, 1400);
    });
  }

  // Contact form (client-side only).
  const form = $("[data-contact-form]");
  const status = $("[data-form-status]");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const name = String(formData.get("name") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const message = String(formData.get("message") ?? "").trim();

      if (!status) return;

      if (!name || !email || !message) {
        status.textContent = "Please fill out all fields.";
        return;
      }

      status.textContent = "Thanks! This demo form doesn’t send messages yet. Use the links to reach me.";
      form.reset();
    });
  }

  // Improve performance: upgrade any placeholder project links when empty.
  const placeholderLinks = $$("a[href=\"#\"]");
  placeholderLinks.forEach((a) => {
    a.addEventListener("click", (event) => {
      event.preventDefault();
      if (status) {
        status.textContent = "Update the project links in index.html to point to your GitHub and live demos.";
      }
    });
  });
})();
