const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#menu");

function closeMenu() {
  if (!menuButton || !menu) return;
  menu.classList.remove("open");
  menuButton.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
}

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuButton.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      menu.classList.contains("open") &&
      !menu.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      closeMenu();
      menuButton.focus();
    }
  });
}

const revealTargets = [
  ...document.querySelectorAll(
    ".intro, .section-head, .service-card, .feature-image, .feature-copy, .treatment-card, .info-panel, .contact-strip, .map-section, .legal"
  ),
];

revealTargets.forEach((element, index) => {
  element.classList.add("reveal");

  if (element.classList.contains("feature-image")) {
    element.classList.add("reveal-left");
  }

  if (element.classList.contains("feature-copy")) {
    element.classList.add("reveal-right");
  }

  if (
    element.classList.contains("service-card") ||
    element.classList.contains("treatment-card") ||
    element.classList.contains("info-panel")
  ) {
    element.style.setProperty("--reveal-delay", `${(index % 4) * 90}ms`);
  }
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealTargets.forEach((element) => revealObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
}

const siteHeader = document.querySelector(".site-header");
const scrollProgress = document.querySelector(".scroll-progress");

function updateHeaderOnScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  if (siteHeader) {
    siteHeader.classList.toggle("is-scrolled", scrollTop > 8);
  }

  if (scrollProgress) {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.setProperty("--scroll-progress", `${Math.min(100, Math.max(0, progress))}%`);
  }
}

updateHeaderOnScroll();
window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });

const navLinks = [
  ...document.querySelectorAll(".menu a[href^='#'], .mobile-quick-nav a[href^='#']"),
];
const spySections = [
  ...new Set(navLinks.map((link) => link.getAttribute("href"))),
]
  .map((href) => document.querySelector(href))
  .filter(Boolean);

if (navLinks.length && spySections.length && "IntersectionObserver" in window) {
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  spySections.forEach((section) => spyObserver.observe(section));
}

const heroMedia = document.querySelector(".hero-media");

if (heroMedia && !prefersReducedMotion) {
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY * 0.18, 90);
        heroMedia.style.setProperty("--parallax-y", `${offset}px`);
        ticking = false;
      });
    },
    { passive: true }
  );
}

if (hasFinePointer && !prefersReducedMotion) {
  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    });
  });

  document.querySelectorAll(".button.primary").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const offsetY = (event.clientY - rect.top - rect.height / 2) * 0.35;
      button.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}
