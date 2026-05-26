const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#menu");

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menu.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
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
