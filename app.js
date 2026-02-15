(() => {
  const $ = (sel, root=document) => root.querySelector(sel);

  // ===== Configura tu WhatsApp aquí =====
  // Formato internacional sin + ni espacios: 34XXXXXXXXX
  const WHATSAPP_NUMBER = "34690088140";
  const SITE_NAME = "Grupo Reformas Barcelona";

  // Footer year
  $("#year").textContent = new Date().getFullYear();

  // Mobile nav
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  navToggle?.addEventListener("click", () => {
    const open = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navMenu?.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Theme (persist)
  const themeBtn = $("#themeBtn");
  const setTheme = (t) => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem("theme", t);
    if (themeBtn) {
      const isLight = t === "light";
      themeBtn.textContent = isLight ? "☀️" : "🌙";
      themeBtn.setAttribute("data-icon", isLight ? "sun" : "moon");
      themeBtn.setAttribute("aria-label", isLight ? "Tema claro" : "Tema oscuro");
    }
  };
  const saved = localStorage.getItem("theme");
  if (saved) setTheme(saved);
  themeBtn?.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(current === "light" ? "dark" : "light");
  });

  // Pills: fill "Tipo de reforma"
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fill]");
    if (!btn) return;
    const val = btn.getAttribute("data-fill");
    const select = $("#tipoReforma");
    if (!select) return;
    // Set to matching option if exists, else set to Otro and write in details
    const opt = [...select.options].find(o => o.textContent.trim() === val);
    if (opt) {
      select.value = opt.textContent.trim();
    } else {
      select.value = "Otro";
      const ta = document.querySelector("textarea[name='detalles']");
      if (ta) ta.value = `${val}. ` + (ta.value || "");
    }
    // Scroll to form
    document.querySelector("#presupuesto")?.scrollIntoView({ behavior: "smooth" });
  });

  // Lightbox gallery
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  let lbState = "before";
  let lbTimer = null;
  const stopLb = () => { if (lbTimer) { clearInterval(lbTimer); lbTimer = null; } };
  const setLbState = (src, alt, state) => {
    if (!src) return;
    lbState = state || "before";
    lightboxImg.dataset.state = lbState;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
  };
  const cycleLb = (before, after, altBase) => {
    stopLb();
    let showAfter = false;
    const tick = () => {
      if (showAfter && after) {
        setLbState(after.src, after.alt || altBase, "after");
      } else if (before) {
        setLbState(before.src, before.alt || altBase, "before");
      }
      showAfter = !showAfter;
    };
    tick();
    lbTimer = setInterval(tick, 2000);
  };
  const lightboxClose = $("#lightboxClose");
  $("#gallery")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".thumb");
    if (!btn) return;
    const src = btn.getAttribute("data-full");
    if (!src) return;
    lightboxImg.src = src;
    lightboxImg.alt = btn.querySelector("img")?.alt || "Imagen ampliada";
    lightbox.setAttribute("aria-hidden", "false");
  });
  const closeLightbox = () => lightbox.setAttribute("aria-hidden", "true");
  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox?.getAttribute("aria-hidden") === "false") closeLightbox();
  });

  // Before/after sliders
  const initComparators = () => {
    document.querySelectorAll(".ba").forEach((ba) => {
      const beforeImg = ba.querySelector(".ba__img--before");
      const afterImg  = ba.querySelector(".ba__img--after");
      let state = ba.dataset.state === "after" ? "after" : "before";
      const setState = (s) => {
        state = s === "after" ? "after" : "before";
        ba.dataset.state = state;
      };
      setState(state);

      // auto-fade cada 3s
      let timer = setInterval(() => setState(state === "after" ? "before" : "after"), 3000);
      const restart = (target) => {
        clearInterval(timer);
        setState(target);
        timer = setInterval(() => setState(state === "after" ? "before" : "after"), 3000);
      };

      ba.addEventListener("click", (e) => {
        if (e.target.closest(".ba__btn")) return;
        restart(state === "after" ? "before" : "after");
      });

      // Lightbox al hacer doble click o click sostenido
      ba.addEventListener("dblclick", () => {
        if (!beforeImg || !afterImg) return;
        lightbox.setAttribute("aria-hidden", "false");
        cycleLb(beforeImg, afterImg, beforeImg.alt || "Imagen ampliada");
      });

      ba.querySelectorAll(".ba__btn").forEach((btn) => {
        btn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const target = btn.dataset.pos === "100" ? "after" : "before";
          restart(target);
        });
      });
    });
  };
  initComparators();

  // Lightbox close
  lightboxClose?.addEventListener("click", () => {
    stopLb();
    lightbox.setAttribute("aria-hidden", "true");
  });
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      stopLb();
      lightbox.setAttribute("aria-hidden", "true");
    }
  });

  // Galería (trabajos): abre imagen única sin loop
  $("#gallery")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".thumb");
    if (!btn) return;
    e.preventDefault();
    stopLb();
    const full = btn.getAttribute("data-full") || btn.querySelector("img")?.src;
    const alt = btn.querySelector("img")?.alt || "Imagen ampliada";
    setLbState(full, alt, "before");
    lightbox.setAttribute("aria-hidden", "false");
  });

  // Ordenar galería por mes (YYYY-MM) descendente usando data-month
  const orderGallery = () => {
    document.querySelectorAll(".gallery .thumb[data-month]").forEach((btn) => {
      const val = btn.dataset.month;
      if (!val) return;
      const key = Number(val.replace("-", ""));
      if (!Number.isNaN(key)) btn.style.order = -key;
    });
  };
  orderGallery();

  // Elimina botón legacy de compartir trabajos si quedara en HTML cacheado
  const legacyShare = document.getElementById("shareWorks");
  if (legacyShare) legacyShare.remove();

  // WhatsApp builder
  const buildWhatsAppUrl = (text) => {
    const msg = encodeURIComponent(text);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };

  const quickMsg = `${SITE_NAME}: Hola, quiero pedir presupuesto. Zona: ___ | Tipo: ___ | Presupuesto: ___ | Urgencia: ___`;
  const waLinks = ["#waSticky"].map(id => $(id)).filter(Boolean);
  waLinks.forEach(a => a.setAttribute("href", buildWhatsAppUrl(quickMsg)));

  // Share whole site
  const shareSiteBtn = $("#shareSite");
  if (shareSiteBtn) {
    const shareUrl = "https://www.gruporeformasbarcelona.com/";
    const shareText = "Grupo Reformas Barcelona · Reformas integrales, baños y cocinas. Presupuesto en 24h.";
    const shareImg = "https://www.gruporeformasbarcelona.com/assets/trabajos/02-2026/work-cocina-og.jpg";
    shareSiteBtn.addEventListener("click", async () => {
      const fallbackMsg = `${shareText}\n${shareUrl}\n${shareImg}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Grupo Reformas Barcelona",
            text: shareText,
            url: shareUrl
          });
        } catch (err) {
          if (err?.name !== "AbortError") console.error("Share failed", err);
        }
      } else {
        const wa = `https://wa.me/?text=${encodeURIComponent(fallbackMsg)}`;
        window.open(wa, "_blank", "noopener");
      }
    });
  }

  // WhatsApp from form
  const waFromForm = $("#waFromForm");
  waFromForm?.addEventListener("click", () => {
    const form = $("#leadForm");
    if (!form) return;
    const data = new FormData(form);
    const msg =
      `${SITE_NAME}\n` +
      `Nombre: ${data.get("nombre") || ""}\n` +
      `Teléfono: ${data.get("telefono") || ""}\n` +
      `Zona: ${data.get("zona") || ""}\n` +
      `Tipo: ${data.get("tipo") || ""}\n` +
      `Presupuesto: ${data.get("presupuesto") || ""}\n` +
      `Urgencia: ${data.get("urgencia") || ""}\n` +
      `Detalles: ${data.get("detalles") || ""}`;
    window.open(buildWhatsAppUrl(msg), "_blank", "noopener,noreferrer");
  });

  // Form submit with AJAX (Formspree)
  const toast = $("#toast");
  const showToast = (msg, ok=true) => {
    if (!toast) return;
    toast.style.display = "block";
    toast.style.color = ok ? "var(--text)" : "var(--muted)";
    toast.textContent = msg;
  };

  // Quitamos envío por email; solo WhatsApp
})();
