/* Ildikóegészségsziget – egyoldalas változat */

const PHONE_HREF = "tel:+36308695321";
const FACEBOOK_URL = "https://www.facebook.com/ildikomasszazs";

/* ---------- Fejléc: görgetés után tömör háttér (asztali nézet) ---------- */
const header = document.querySelector(".site-header");

function updateHeader() {
  header?.classList.toggle("is-solid", window.scrollY > 40);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

/* ---------- Kezeléskártyák ---------- */
const cards = [...document.querySelectorAll(".t-card")];

// Időpontkérő gombok minden lenyíló kártya aljára
cards.forEach((card) => {
  const name = card.querySelector(".t-head strong")?.textContent.trim() ?? "";
  const cta = document.createElement("div");
  cta.className = "t-cta";
  cta.innerHTML = `
    <a class="btn btn-primary" href="${PHONE_HREF}" aria-label="Időpontot kérek telefonon: ${name}">
      <svg aria-hidden="true"><use href="#i-phone"/></svg>Időpontot kérek
    </a>
    <a class="btn btn-quiet" href="${FACEBOOK_URL}" target="_blank" rel="noopener">
      <svg aria-hidden="true"><use href="#i-chat"/></svg>Üzenet Facebookon
    </a>`;
  (card.querySelector(".t-text") ?? card.querySelector(".t-body")).append(cta);
});

// Ha a link egy kártyára mutat (pl. #bemer), nyíljon le
function openFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (target?.classList.contains("t-card")) {
    target.open = true;
    requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  }
}

openFromHash();
window.addEventListener("hashchange", openFromHash);

// Megnyitáskor a kártya teteje maradjon látható
cards.forEach((card) => {
  card.addEventListener("toggle", () => {
    if (!card.open) return;
    const top = card.getBoundingClientRect().top;
    if (top < 0) card.scrollIntoView({ block: "start" });
  });
});

/* ---------- Kategóriasáv: az aktuális szakasz kiemelése ---------- */
const chipScroll = document.querySelector(".chipbar-scroll");
const chips = chipScroll ? [...chipScroll.querySelectorAll("a")] : [];
const sections = chips.map((chip) => document.querySelector(chip.getAttribute("href"))).filter(Boolean);

function setActiveChip(id) {
  chips.forEach((chip) => {
    const active = chip.getAttribute("href") === `#${id}`;
    if (active === chip.classList.contains("is-active")) return;
    chip.classList.toggle("is-active", active);
    if (active) {
      chip.setAttribute("aria-current", "true");
      // csak a sávot görgetjük vízszintesen, az oldalt nem
      const left = chip.offsetLeft - (chipScroll.clientWidth - chip.offsetWidth) / 2;
      chipScroll.scrollTo({ left, behavior: "smooth" });
    } else {
      chip.removeAttribute("aria-current");
    }
  });
}

if (sections.length && "IntersectionObserver" in window) {
  const visible = new Set();
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      const current = sections.find((section) => visible.has(section));
      if (current) setActiveChip(current.id);
    },
    { rootMargin: "-25% 0px -65% 0px" }
  );
  sections.forEach((section) => spy.observe(section));
}

/* ---------- Képnagyító ---------- */
const lightbox = document.querySelector(".lightbox");

if (lightbox && typeof lightbox.showModal === "function") {
  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".lightbox-caption");

  document.querySelectorAll("[data-gallery] button").forEach((button) => {
    button.addEventListener("click", () => {
      const img = button.querySelector("img");
      if (!img) return;
      lightboxImg.src = button.dataset.full || img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = img.alt;
      lightbox.showModal();
    });
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
}
