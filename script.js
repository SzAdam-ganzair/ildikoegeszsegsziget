/* Ildikóegészségsziget – egyoldalas változat */

const PHONE_HREF = "tel:+36308695321";
const FACEBOOK_URL = "https://www.facebook.com/ildikomasszazs";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Fejléc: görgetés után tömör háttér (asztali nézet) ---------- */
const header = document.querySelector(".site-header");

function updateHeader() {
  header?.classList.toggle("is-solid", window.scrollY > 40);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

/* ---------- Görgetésre beúszó elemek ---------- */
// [szelektor, típus, lépcsőzés ms-ben az egy szülőn belüli testvérek között]
const revealRules = [
  [".statstrip li", "up", 110],
  [".section-head, .sec-head", "up", 0],
  [".catnav a", "up", 70],
  [".pcard", "zoom", 80],
  [".aroma-photo, .bemer-shots, .zig-photo, .about-photo, .cta-band", "zoom", 0],
  [".aroma-copy, .bemer-copy, .zig-copy, .about-copy, .contact-copy, .contact-map, .tabs", "up", 0],
  [".hcard", "up", 0],
  [".vcard", "up", 140],
  [".tiles li", "up", 70],
];

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        revealObserver.unobserve(el);
        el.classList.add("is-in");
        // az animáció végén levesszük a jelölést, hogy ne zavarja a hover-effekteket
        const delay = parseInt(el.style.getPropertyValue("--d") || "0", 10);
        setTimeout(() => {
          el.removeAttribute("data-reveal");
          el.classList.remove("is-in");
          el.style.removeProperty("--d");
        }, delay + 900);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  revealRules.forEach(([selector, type, stagger]) => {
    const perParent = new Map();
    document.querySelectorAll(selector).forEach((el) => {
      el.dataset.reveal = type;
      if (stagger) {
        const index = perParent.get(el.parentElement) ?? 0;
        perParent.set(el.parentElement, index + 1);
        el.style.setProperty("--d", `${Math.min(index, 5) * stagger}ms`);
      }
      revealObserver.observe(el);
    });
  });
}

/* ---------- Felpörgő számok ---------- */
const counters = document.querySelectorAll("[data-count]");

if (counters.length && "IntersectionObserver" in window && !reducedMotion) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        countObserver.unobserve(el);
        const target = Number(el.dataset.count);
        const duration = 1100 + target * 25;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(tick);
        };
        el.textContent = "0";
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => countObserver.observe(el));
}

/* ---------- Fülek (Alakformálás) ---------- */
const tabs = [...document.querySelectorAll(".tablist [role='tab']")];

function selectTab(tab, focus = false) {
  tabs.forEach((other) => {
    const selected = other === tab;
    other.setAttribute("aria-selected", String(selected));
    other.tabIndex = selected ? 0 : -1;
    document.getElementById(other.getAttribute("aria-controls")).hidden = !selected;
  });
  if (focus) tab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    selectTab(tabs[(index + step + tabs.length) % tabs.length], true);
  });
});

// Időpontkérő gombok a fülek paneljeinek aljára
document.querySelectorAll(".tabpanel").forEach((panel) => {
  const cta = document.createElement("div");
  cta.className = "t-cta";
  cta.innerHTML = `
    <a class="btn btn-primary" href="${PHONE_HREF}" aria-label="Időpontot kérek telefonon: ${panel.dataset.title}">
      <svg aria-hidden="true"><use href="#i-phone"/></svg>Időpontot kérek
    </a>
    <a class="btn btn-quiet" href="${FACEBOOK_URL}" target="_blank" rel="noopener">
      <svg aria-hidden="true"><use href="#i-chat"/></svg>Üzenet Facebookon
    </a>`;
  (panel.querySelector(".t-text") ?? panel).append(cta);
});

/* ---------- Részletező lap ---------- */
const sheet = document.querySelector(".sheet");
const sheetBody = sheet?.querySelector(".sheet-body");
const sheetTitle = sheet?.querySelector("#sheet-title");
const sheetCat = sheet?.querySelector("#sheet-cat");
const canSheet = sheet && typeof sheet.showModal === "function";
let closeTimer = 0;

function openSheet(card, pushHistory = true) {
  const detail = card.querySelector(".t-detail");
  if (!canSheet || !detail) return;
  clearTimeout(closeTimer);
  sheet.classList.remove("is-closing");
  sheetTitle.textContent = (card.dataset.title || card.querySelector("strong, h3")?.textContent || "").replace(/­/g, "").trim();
  sheetCat.textContent = card.dataset.cat || "";
  sheetBody.innerHTML = detail.innerHTML;
  sheetBody.scrollTop = 0;
  if (!sheet.open) sheet.showModal();
  if (pushHistory) history.pushState({ sheet: card.id }, "", `#${card.id}`);
}

function closeSheet() {
  if (!sheet?.open) return;
  sheet.classList.add("is-closing");
  closeTimer = setTimeout(
    () => {
      sheet.classList.remove("is-closing");
      sheet.close();
    },
    reducedMotion ? 0 : 230
  );
}

// Bezárás kérése: ha a lapot mi nyitottuk (van előzménybejegyzés), a Vissza gombbal egyenértékű
function requestCloseSheet() {
  if (history.state?.sheet) history.back();
  else {
    closeSheet();
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  }
}

if (canSheet) {
  document.addEventListener("click", (event) => {
    const opener = event.target.closest(".pcard-btn, [data-open]");
    const card = opener?.closest("[data-sheet]");
    if (card) openSheet(card);
  });

  sheet.querySelector(".sheet-close").addEventListener("click", requestCloseSheet);
  sheet.addEventListener("click", (event) => {
    if (event.target === sheet) requestCloseSheet();
  });
  sheet.addEventListener("cancel", (event) => {
    event.preventDefault();
    requestCloseSheet();
  });

  window.addEventListener("popstate", (event) => {
    const card = event.state?.sheet && document.getElementById(event.state.sheet);
    if (card) openSheet(card, false);
    else closeSheet();
  });
}

/* ---------- Közvetlen linkek (pl. #bemer, #kavitacio) ---------- */
function openFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id && document.getElementById(id);
  if (!target) return;
  if (target.matches(".tabpanel")) {
    selectTab(document.getElementById(`tab-${id}`));
    document.getElementById("alakformalas").scrollIntoView();
  } else if (target.matches("[data-sheet]") && !target.matches(".bemer, .aroma-split, .zig")) {
    openSheet(target, false);
  }
}

openFromHash();

/* ---------- Képnagyító ---------- */
const lightbox = document.querySelector(".lightbox");

if (lightbox && typeof lightbox.showModal === "function") {
  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".lightbox-caption");

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery] button");
    const img = button?.querySelector("img");
    if (!img) return;
    lightboxImg.src = button.dataset.full || img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt;
    lightbox.showModal();
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
}
