"use strict";

/* =========================================================
   PORTFOLIO DE JOSEFINA HARRIS
   Navegación editorial + interacciones del proyecto existente
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeCurrentYear();
  initializeMediaAssets();
  initializeHeader();
  initializeHeroCarousel();
  initializeRevealAnimations();
  initializeContactForm();
  initializeImageLightbox();
});

/* =========================================================
   AÑO AUTOMÁTICO
========================================================= */
function initializeCurrentYear() {
  const currentYear = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = currentYear;
  });
}

/* =========================================================
   MEDIOS: conserva el fallback del proyecto original
========================================================= */
function initializeMediaAssets() {
  const supportedImageExtensions = ["webp", "png", "jpg", "jpeg", "JPG", "heic", "HEIC"];

  document.querySelectorAll("img[data-image-base]").forEach((image) => {
    const imageBase = image.dataset.imageBase;
    if (!imageBase) return;

    const currentSource = image.getAttribute("src") || "";
    const currentExtension = currentSource.split(".").pop();
    const orderedExtensions = [currentExtension, ...supportedImageExtensions].filter(
      (extension, index, extensions) =>
        extension &&
        supportedImageExtensions.includes(extension) &&
        extensions.indexOf(extension) === index
    );

    let extensionIndex = 0;
    image.addEventListener("error", () => {
      extensionIndex += 1;
      if (extensionIndex < orderedExtensions.length) {
        image.src = `${imageBase}.${orderedExtensions[extensionIndex]}`;
      }
    });
  });
}

/* =========================================================
   HEADER
========================================================= */
function initializeHeader() {
  const header = document.querySelector("#site-header");
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

/* =========================================================
   MENÚ VISUAL DE TARJETAS
   Desktop: tarjetas superpuestas / rotativas
   Mobile: carrusel horizontal con scroll-snap
========================================================= */
function initializeHeroCarousel() {
  const carousel = document.querySelector("[data-hero-carousel]");
  const track = document.querySelector("[data-hero-track]");
  const cards = Array.from(document.querySelectorAll("[data-hero-card]"));
  const prevButton = document.querySelector("[data-hero-prev]");
  const nextButton = document.querySelector("[data-hero-next]");
  const currentLabel = document.querySelector("[data-hero-current]");
  const titleLabel = document.querySelector("[data-hero-title]");
  const openLink = document.querySelector("[data-hero-open]");

  if (!carousel || !track || cards.length === 0) return;

  const mobileQuery = window.matchMedia("(max-width: 900px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let pointerStartX = null;
  let pointerStartY = null;

  const getSignedDistance = (index) => {
    let distance = (index - activeIndex + cards.length) % cards.length;
    if (distance > cards.length / 2) distance -= cards.length;
    return distance;
  };

  const clearPositionClasses = (card) => {
    card.classList.remove(
      "is-active",
      "is-prev-1", "is-prev-2", "is-prev-3",
      "is-next-1", "is-next-2", "is-next-3",
      "is-far"
    );
  };

  const updateCards = ({ centerMobile = true } = {}) => {
    cards.forEach((card, index) => {
      clearPositionClasses(card);
      const distance = getSignedDistance(index);
      const isActive = index === activeIndex;

      card.setAttribute("aria-pressed", String(isActive));

      if (isActive) {
        card.classList.add("is-active");
      } else if (distance === -1) {
        card.classList.add("is-prev-1");
      } else if (distance === -2) {
        card.classList.add("is-prev-2");
      } else if (distance === -3) {
        card.classList.add("is-prev-3");
      } else if (distance === 1) {
        card.classList.add("is-next-1");
      } else if (distance === 2) {
        card.classList.add("is-next-2");
      } else if (distance === 3) {
        card.classList.add("is-next-3");
      } else {
        card.classList.add("is-far");
      }

      card.tabIndex = mobileQuery.matches || Math.abs(distance) <= 3 ? 0 : -1;
    });

    const activeCard = cards[activeIndex];
    const target = activeCard.dataset.target || "#perfil";
    const title = activeCard.dataset.cardTitle || "Sección";

    if (currentLabel) currentLabel.textContent = String(activeIndex + 1).padStart(2, "0");
    if (titleLabel) titleLabel.textContent = title;
    if (openLink) {
      openLink.href = target;
      openLink.setAttribute("aria-label", `Abrir sección ${title}`);
    }

    if (mobileQuery.matches && centerMobile) {
      window.requestAnimationFrame(() => {
        activeCard.scrollIntoView({
          behavior: reducedMotionQuery.matches ? "auto" : "smooth",
          block: "nearest",
          inline: "center"
        });
      });
    }
  };

  const activate = (index, options = {}) => {
    activeIndex = (index + cards.length) % cards.length;
    updateCards(options);
  };

  const openTarget = (card) => {
    const targetSelector = card.dataset.target;
    if (!targetSelector) return;
    const target = document.querySelector(targetSelector);
    if (!target) return;

    target.scrollIntoView({
      behavior: reducedMotionQuery.matches ? "auto" : "smooth",
      block: "start"
    });
  };

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      if (index === activeIndex) {
        openTarget(card);
      } else {
        activate(index);
      }
    });
  });

  prevButton?.addEventListener("click", () => activate(activeIndex - 1));
  nextButton?.addEventListener("click", () => activate(activeIndex + 1));

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      activate(activeIndex - 1);
      cards[activeIndex].focus({ preventScroll: true });
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      activate(activeIndex + 1);
      cards[activeIndex].focus({ preventScroll: true });
    }
    if (event.key === "Home") {
      event.preventDefault();
      activate(0);
      cards[activeIndex].focus({ preventScroll: true });
    }
    if (event.key === "End") {
      event.preventDefault();
      activate(cards.length - 1);
      cards[activeIndex].focus({ preventScroll: true });
    }
  });

  track.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
  });

  track.addEventListener("pointerup", (event) => {
    if (pointerStartX === null || pointerStartY === null) return;

    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;
    pointerStartX = null;
    pointerStartY = null;

    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    activate(deltaX < 0 ? activeIndex + 1 : activeIndex - 1);
  });

  mobileQuery.addEventListener("change", () => updateCards({ centerMobile: false }));
  updateCards({ centerMobile: false });
}

/* =========================================================
   ANIMACIONES DE APARICIÓN
========================================================= */
function initializeRevealAnimations() {
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const selectors = [
    ".section-heading",
    ".profile__image",
    ".profile__content",
    ".case-study__header",
    ".case-study__cover",
    ".case-study__information",
    ".project-gallery__item",
    ".metric-card",
    ".contact__content",
    ".contact-form"
  ];

  const elements = document.querySelectorAll(selectors.join(","));
  if (elements.length === 0) return;

  elements.forEach((element, index) => {
    element.setAttribute("data-reveal", "");
    element.style.transitionDelay = `${Math.min((index % 4) * 55, 165)}ms`;
  });

  if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
  );

  elements.forEach((element) => observer.observe(element));
}

/* =========================================================
   FORMULARIO DE CONTACTO — conserva el comportamiento mailto
========================================================= */
function initializeContactForm() {
  const contactForm = document.querySelector("[data-contact-form]");
  const formStatus = document.querySelector("[data-form-status]");
  if (!contactForm) return;

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      if (formStatus) formStatus.textContent = "Revisá los campos obligatorios antes de continuar.";
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get("nombre") || "").trim();
    const email = String(formData.get("correo") || "").trim();
    const subject = String(formData.get("asunto") || "").trim();
    const message = String(formData.get("mensaje") || "").trim();
    const formAction = contactForm.getAttribute("action") || "";
    const recipient = formAction.replace(/^mailto:/i, "").split("?")[0].trim();

    if (!recipient) {
      if (formStatus) formStatus.textContent = "No se encontró una dirección de correo válida.";
      return;
    }

    const mailtoUrl =
      `mailto:${recipient}` +
      `?subject=${encodeURIComponent(subject || "Consulta desde el portfolio")}` +
      `&body=${encodeURIComponent([`Nombre: ${name}`, `Correo: ${email}`, "", "Mensaje:", message].join("\n"))}`;

    if (formStatus) formStatus.textContent = "Se abrirá tu aplicación de correo para completar el envío.";
    window.location.href = mailtoUrl;
  });
}

/* =========================================================
   LIGHTBOX DE GALERÍAS
========================================================= */
function initializeImageLightbox() {
  const lightbox = document.querySelector("[data-image-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const closeButtons = document.querySelectorAll("[data-lightbox-close]");
  const galleryImages = document.querySelectorAll(".project-gallery__image:not([data-no-lightbox])");

  if (!lightbox || !lightboxImage || galleryImages.length === 0) return;

  let previousFocus = null;

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");

    window.setTimeout(() => {
      lightbox.hidden = true;
      lightboxImage.removeAttribute("src");
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    }, 180);
  };

  const openLightbox = (image) => {
    previousFocus = document.activeElement;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "Imagen ampliada";
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    window.requestAnimationFrame(() => lightbox.classList.add("is-open"));
    lightbox.querySelector(".image-lightbox__close")?.focus();
  };

  galleryImages.forEach((image) => {
    image.classList.add("is-lightbox-enabled");
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `${image.alt || "Imagen"}. Ver imagen completa`);
    image.addEventListener("click", () => openLightbox(image));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });

  closeButtons.forEach((button) => button.addEventListener("click", closeLightbox));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
}
