/* ==========================================================================
   SMC IMPIANTI — SCRIPT PRINCIPALE
   Indice:
   1. Menu mobile (hamburger)
   2. Switch lingua IT / EN
   3. Animazioni on-scroll (IntersectionObserver)
   4. Galleria: filtro + lightbox
   5. Form contatti (validazione base, no invio reale)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initLanguageSwitch();
  initScrollReveal();
  initGalleryFilter();
  initLightbox();
  initContactForm();
});

/* --------------------------------------------------------------------
   1. MENU MOBILE
   -------------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.querySelector(".hamburger");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // Chiude il menu quando si seleziona una voce (utile su mobile)
  nav.querySelectorAll(".nav-list a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
}

/* --------------------------------------------------------------------
   2. SWITCH LINGUA (IT / EN)
   Ogni elemento traducibile porta un attributo data-en con il testo
   inglese. Il testo italiano è quello già presente nell'HTML.
   Per attributi (placeholder, alt, title) si usano data-en-placeholder,
   data-en-alt, data-en-title.
   -------------------------------------------------------------------- */
const LANG_KEY = "smc-lang";

function initLanguageSwitch() {
  const buttons = document.querySelectorAll("[data-lang-btn]");
  const savedLang = localStorage.getItem(LANG_KEY) || "it";

  applyLanguage(savedLang);
  updateLangButtons(savedLang);

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang-btn");
      localStorage.setItem(LANG_KEY, lang);
      applyLanguage(lang);
      updateLangButtons(lang);
    });
  });
}

function updateLangButtons(lang) {
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle(
      "is-active",
      btn.getAttribute("data-lang-btn") === lang,
    );
  });
}

function applyLanguage(lang) {
  document.documentElement.setAttribute("lang", lang);

  // Testo semplice (contenuto interno dell'elemento)
  document.querySelectorAll("[data-en]").forEach((el) => {
    if (!el.dataset.it) {
      el.dataset.it = el.innerHTML.trim();
    }
    el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.it;
  });

  // Placeholder dei campi form
  document.querySelectorAll("[data-en-placeholder]").forEach((el) => {
    if (!el.dataset.itPlaceholder) {
      el.dataset.itPlaceholder = el.getAttribute("placeholder") || "";
    }
    el.setAttribute(
      "placeholder",
      lang === "en" ? el.dataset.enPlaceholder : el.dataset.itPlaceholder,
    );
  });

  // Attributo alt delle immagini
  document.querySelectorAll("[data-en-alt]").forEach((el) => {
    if (!el.dataset.itAlt) {
      el.dataset.itAlt = el.getAttribute("alt") || "";
    }
    el.setAttribute("alt", lang === "en" ? el.dataset.enAlt : el.dataset.itAlt);
  });

  // Titolo della pagina (tag <title>)
  const titleEl = document.querySelector("title[data-en]");
  if (titleEl) {
    document.title = lang === "en" ? titleEl.dataset.en : titleEl.dataset.it;
  }
}

/* --------------------------------------------------------------------
   3. ANIMAZIONI ON-SCROLL
   Le sezioni/card con classe "reveal" appaiono con fade-in / slide-up
   quando entrano nel viewport. Rispetta prefers-reduced-motion.
   -------------------------------------------------------------------- */
function initScrollReveal() {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const items = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  // Piccolo sfalsamento automatico per elementi affiancati (card, griglie)
  items.forEach((el, i) => {
    el.style.setProperty("--delay", `${(i % 6) * 70}ms`);
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  items.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------
   4. GALLERIA: FILTRO + LIGHTBOX
   -------------------------------------------------------------------- */
function initGalleryFilter() {
  const filterButtons = document.querySelectorAll("[data-filter]");
  const galleryItems = document.querySelectorAll(".gallery-item");
  if (!filterButtons.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const filter = btn.getAttribute("data-filter");

      galleryItems.forEach((item) => {
        const category = item.getAttribute("data-category");
        const show = filter === "all" || filter === category;
        item.style.display = show ? "" : "none";
      });
    });
  });
}

function initLightbox() {
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
  const lightbox = document.querySelector(".lightbox");
  if (!galleryItems.length || !lightbox) return;

  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".lightbox__caption");
  const closeBtn = lightbox.querySelector(".lightbox__close");
  const prevBtn = lightbox.querySelector(".lightbox__nav--prev");
  const nextBtn = lightbox.querySelector(".lightbox__nav--next");

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    updateLightboxContent();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function updateLightboxContent() {
    const item = galleryItems[currentIndex];
    const img = item.querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt;
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    updateLightboxContent();
  }

  function showPrev() {
    currentIndex =
      (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxContent();
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });

  closeBtn.addEventListener("click", closeLightbox);
  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });
}

/* --------------------------------------------------------------------
   5. FORM CONTATTI
   Nessun backend: alla conferma il form apre il client email
   dell'utente (mailto:) con oggetto e messaggio già precompilati.
   -------------------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const feedback = form.querySelector(".form-feedback");
  const RECIPIENT_EMAIL = "info@smcimpianti.it";

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const lang = document.documentElement.getAttribute("lang") || "it";

    // Validazione minima lato client
    const requiredFields = form.querySelectorAll("[required]");
    let valid = true;

    requiredFields.forEach((field) => {
      const isEmpty = !field.value.trim();
      const isUnchecked = field.type === "checkbox" && !field.checked;

      if (isEmpty || isUnchecked) {
        valid = false;
        field.style.borderColor = "var(--color-red)";
      } else {
        field.style.borderColor = "var(--color-line)";
      }
    });

    if (!valid) {
      if (feedback) {
        feedback.textContent =
          lang === "en"
            ? "Please fill in all required fields."
            : "Compila tutti i campi obbligatori.";
        feedback.style.color = "var(--color-red)";
      }
      return;
    }

    // Raccoglie i valori dei campi
    const name = form.querySelector("#name").value.trim();
    const email = form.querySelector("#email").value.trim();
    const phone = form.querySelector("#phone").value.trim();
    const subjectField = form.querySelector("#subject").value.trim();
    const message = form.querySelector("#message").value.trim();

    const subject =
      subjectField ||
      (lang === "en"
        ? "Website contact request"
        : "Richiesta di contatto dal sito");

    const bodyLines =
      lang === "en"
        ? [
            `Name: ${name}`,
            `Email: ${email}`,
            phone ? `Phone: ${phone}` : null,
            "",
            message,
          ]
        : [
            `Nome: ${name}`,
            `Email: ${email}`,
            phone ? `Telefono: ${phone}` : null,
            "",
            message,
          ];

    const body = bodyLines.filter((line) => line !== null).join("\n");

    // URL Gmail compose
    const gmailUrl =
      "https://mail.google.com/mail/?" +
      "view=cm&fs=1&tf=1" +
      "&to=" +
      encodeURIComponent(RECIPIENT_EMAIL) +
      "&su=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    // apre Gmail in nuova tab
    window.open(gmailUrl, "_blank");

    if (feedback) {
      feedback.textContent =
        lang === "en"
          ? "Gmail should open in a new tab with the message ready — just hit send."
          : "Dovrebbe aprirsi Gmail in una nuova scheda con il messaggio già pronto: ti basta premere invia.";
      feedback.style.color = "var(--color-navy)";
    }
  });
}
