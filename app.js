(() => {
  const $ = (sel, root=document) => root.querySelector(sel);

  // ===== Configura tu WhatsApp aquí =====
  // Formato internacional sin + ni espacios: 34XXXXXXXXX
  const WHATSAPP_NUMBER = "34XXXXXXXXX";
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

  // WhatsApp builder
  const buildWhatsAppUrl = (text) => {
    const msg = encodeURIComponent(text);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };

  const quickMsg = `${SITE_NAME}: Hola, quiero pedir presupuesto. Zona: ___ | Tipo: ___ | Presupuesto: ___ | Urgencia: ___`;
  const waLinks = ["#waTop", "#waSticky"].map(id => $(id)).filter(Boolean);
  waLinks.forEach(a => a.setAttribute("href", buildWhatsAppUrl(quickMsg)));

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

  const form = $("#leadForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot
    const hp = form.querySelector("input[name='_gotcha']");
    if (hp && hp.value) return;

    const action = form.getAttribute("action");
    if (!action || action.includes("XXXXYYYY")) {
      showToast("Falta configurar Formspree (action). Mientras tanto usa WhatsApp.", false);
      return;
    }

    try {
      const res = await fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });
      if (res.ok) {
        form.reset();
        showToast("Listo. Recibimos tu solicitud. Te contactamos hoy ?", true);
      } else {
        showToast("No se pudo enviar. Prueba por WhatsApp.", false);
      }
    } catch {
      showToast("Error de conexión. Prueba por WhatsApp.", false);
    }
  });
})();
