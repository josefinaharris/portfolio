"use strict";

/* =========================================================
   PORTFOLIO DE JOSEFINA HARRIS
   Archivo: script.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeCurrentYear();
    initializeMediaAssets();
    initializeHeader();
    initializeMobileMenu();
    initializeActiveNavigation();
    initializeRevealAnimations();
    initializeContactForm();
    initializeImageLightbox();
});




/* =========================================================
   MEDIOS: IMÁGENES CON EXTENSIONES ALTERNATIVAS Y VIDEO HERO
========================================================= */

function initializeMediaAssets() {
    const supportedImageExtensions = ["png", "jpg", "jpeg", "JPG", "webp", "heic", "HEIC"];

    document.querySelectorAll("img[data-image-base]").forEach((image) => {
        const imageBase = image.dataset.imageBase;

        if (!imageBase) {
            return;
        }

        const currentSource = image.getAttribute("src") || "";
        const currentExtension = currentSource.split(".").pop();
        const orderedExtensions = [
            currentExtension,
            ...supportedImageExtensions
        ].filter((extension, index, extensions) => {
            return (
                extension &&
                supportedImageExtensions.includes(extension) &&
                extensions.indexOf(extension) === index
            );
        });

        let extensionIndex = 0;

        image.addEventListener("error", () => {
            extensionIndex += 1;

            if (extensionIndex >= orderedExtensions.length) {
                return;
            }

            image.src = `${imageBase}.${orderedExtensions[extensionIndex]}`;
        });
    });

    const heroVideo = document.querySelector(".hero__video");

    if (!heroVideo) {
        return;
    }

    heroVideo.muted = true;
    heroVideo.loop = true;
    heroVideo.playsInline = true;

    const startVideo = () => {
        const playback = heroVideo.play();

        if (playback instanceof Promise) {
            playback.catch(() => {
                /*
                    Algunos navegadores pueden bloquear la reproducción
                    automática hasta que exista una interacción del usuario.
                */
            });
        }
    };

    if (heroVideo.readyState >= 2) {
        startVideo();
    } else {
        heroVideo.addEventListener("canplay", startVideo, {
            once: true
        });
    }
}


/* =========================================================
   1. AÑO AUTOMÁTICO
========================================================= */

function initializeCurrentYear() {
    const yearElements = document.querySelectorAll("[data-current-year]");
    const currentYear = new Date().getFullYear();

    yearElements.forEach((element) => {
        element.textContent = currentYear;
    });
}


/* =========================================================
   2. HEADER AL HACER SCROLL
========================================================= */

function initializeHeader() {
    const header = document.querySelector("#site-header");

    if (!header) {
        return;
    }

    const updateHeader = () => {
        const hasScrolled = window.scrollY > 24;

        header.classList.toggle("is-scrolled", hasScrolled);
    };

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });
}


/* =========================================================
   3. MENÚ MÓVIL ACCESIBLE
========================================================= */

function initializeMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navigation = document.querySelector("#main-navigation");

    if (!menuToggle || !navigation) {
        return;
    }

    const mobileMediaQuery = window.matchMedia("(max-width: 900px)");

    let isMenuOpen = false;
    let previousFocusedElement = null;

    const getFocusableElements = () => {
        const navigationFocusableElements = navigation.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        return [
            menuToggle,
            ...navigationFocusableElements
        ].filter((element) => {
            return !element.hasAttribute("disabled");
        });
    };

    const updateNavigationAccessibility = () => {
        if (mobileMediaQuery.matches) {
            navigation.setAttribute(
                "aria-hidden",
                String(!isMenuOpen)
            );
        } else {
            navigation.setAttribute("aria-hidden", "false");
        }
    };

    const openMenu = () => {
        if (!mobileMediaQuery.matches) {
            return;
        }

        isMenuOpen = true;
        previousFocusedElement = document.activeElement;

        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute(
            "aria-label",
            "Cerrar menú de navegación"
        );

        menuToggle.classList.add("is-active");

        navigation.classList.add("is-open");
        navigation.dataset.open = "true";
        navigation.setAttribute("aria-hidden", "false");

        document.body.classList.add("menu-open");

        window.requestAnimationFrame(() => {
            const firstNavigationLink = navigation.querySelector("a");

            if (firstNavigationLink) {
                firstNavigationLink.focus();
            }
        });
    };

    const closeMenu = (restoreFocus = true) => {
        isMenuOpen = false;

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute(
            "aria-label",
            "Abrir menú de navegación"
        );

        menuToggle.classList.remove("is-active");

        navigation.classList.remove("is-open");
        navigation.dataset.open = "false";

        document.body.classList.remove("menu-open");

        updateNavigationAccessibility();

        if (
            restoreFocus &&
            previousFocusedElement instanceof HTMLElement
        ) {
            previousFocusedElement.focus();
        }
    };

    const toggleMenu = () => {
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    const trapFocus = (event) => {
        if (
            !isMenuOpen ||
            !mobileMediaQuery.matches ||
            event.key !== "Tab"
        ) {
            return;
        }

        const focusableElements = getFocusableElements();

        if (focusableElements.length === 0) {
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement =
            focusableElements[focusableElements.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === firstElement
        ) {
            event.preventDefault();
            lastElement.focus();
            return;
        }

        if (
            !event.shiftKey &&
            document.activeElement === lastElement
        ) {
            event.preventDefault();
            firstElement.focus();
        }
    };

    menuToggle.addEventListener("click", toggleMenu);

    navigation.addEventListener("click", (event) => {
        const clickedLink = event.target.closest("a");

        if (!clickedLink) {
            return;
        }

        if (mobileMediaQuery.matches) {
            closeMenu(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isMenuOpen) {
            closeMenu();
            return;
        }

        trapFocus(event);
    });

    mobileMediaQuery.addEventListener("change", (event) => {
        if (!event.matches && isMenuOpen) {
            closeMenu(false);
        }

        updateNavigationAccessibility();
    });

    navigation.dataset.open = "false";
    updateNavigationAccessibility();
}


/* =========================================================
   4. INDICADOR DE SECCIÓN ACTIVA
========================================================= */

function initializeActiveNavigation() {
    const navigationLinks = document.querySelectorAll(
        "[data-navigation-link]"
    );

    const sections = document.querySelectorAll(
        "[data-section][id]"
    );

    if (
        navigationLinks.length === 0 ||
        sections.length === 0
    ) {
        return;
    }

    const setActiveLink = (sectionId) => {
        navigationLinks.forEach((link) => {
            const linkTarget = link.getAttribute("href");
            const isActive = linkTarget === `#${sectionId}`;

            link.classList.toggle("is-active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    };

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (firstEntry, secondEntry) =>
                            secondEntry.intersectionRatio -
                            firstEntry.intersectionRatio
                    );

                const mostVisibleSection = visibleEntries[0];

                if (mostVisibleSection) {
                    setActiveLink(mostVisibleSection.target.id);
                }
            },
            {
                root: null,
                rootMargin: "-28% 0px -58% 0px",
                threshold: [0, 0.1, 0.25, 0.5]
            }
        );

        sections.forEach((section) => {
            sectionObserver.observe(section);
        });

        return;
    }

    /*
        Alternativa para navegadores que no admiten
        IntersectionObserver.
    */
    const updateActiveSection = () => {
        const referencePosition =
            window.scrollY + window.innerHeight * 0.4;

        let currentSectionId = sections[0].id;

        sections.forEach((section) => {
            if (section.offsetTop <= referencePosition) {
                currentSectionId = section.id;
            }
        });

        setActiveLink(currentSectionId);
    };

    updateActiveSection();

    window.addEventListener("scroll", updateActiveSection, {
        passive: true
    });
}



/* =========================================================
   5. ANIMACIONES DE APARICIÓN
========================================================= */

function initializeRevealAnimations() {
    const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const revealSelectors = [
        ".section-heading",
        ".project-card",
        ".case-study__header",
        ".case-study__cover",
        ".case-study__information",
        ".project-gallery__item",
        ".metric-card",
        ".profile__image",
        ".profile__content",
        ".capability-card",
        ".tools-panel",
        ".result-card",
        ".contact__content",
        ".contact-form"
    ];

    const revealElements = document.querySelectorAll(
        revealSelectors.join(",")
    );

    if (revealElements.length === 0) {
        return;
    }

    revealElements.forEach((element, index) => {
        element.setAttribute("data-reveal", "");

        /*
            Se aplica una demora breve y limitada.
            No se crean animaciones largas o excesivas.
        */
        const delay = Math.min((index % 4) * 70, 210);

        element.style.transitionDelay = `${delay}ms`;
    });

    if (
        reducedMotionQuery.matches ||
        !("IntersectionObserver" in window)
    ) {
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
            element.style.transitionDelay = "0ms";
        });

        return;
    }

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            root: null,
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.12
        }
    );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });

    reducedMotionQuery.addEventListener("change", (event) => {
        if (!event.matches) {
            return;
        }

        revealElements.forEach((element) => {
            element.classList.add("is-visible");
            element.style.transitionDelay = "0ms";
            revealObserver.unobserve(element);
        });
    });
}


/* =========================================================
   6. FORMULARIO DE CONTACTO
========================================================= */

function initializeContactForm() {
    const contactForm = document.querySelector(
        "[data-contact-form]"
    );

    const formStatus = document.querySelector(
        "[data-form-status]"
    );

    if (!contactForm) {
        return;
    }

    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();

            if (formStatus) {
                formStatus.textContent =
                    "Revisá los campos obligatorios antes de continuar.";
            }

            return;
        }

        const formData = new FormData(contactForm);

        const name =
            String(formData.get("nombre") || "").trim();

        const email =
            String(formData.get("correo") || "").trim();

        const subject =
            String(formData.get("asunto") || "").trim();

        const message =
            String(formData.get("mensaje") || "").trim();

        const formAction =
            contactForm.getAttribute("action") || "";

        const recipient = formAction
            .replace(/^mailto:/i, "")
            .split("?")[0]
            .trim();

        if (!recipient) {
            if (formStatus) {
                formStatus.textContent =
                    "No se encontró una dirección de correo válida.";
            }

            return;
        }

        const emailSubject =
            subject || "Consulta desde el portfolio";

        const emailBody = [
            `Nombre: ${name}`,
            `Correo: ${email}`,
            "",
            "Mensaje:",
            message
        ].join("\n");

        const mailtoUrl =
            `mailto:${recipient}` +
            `?subject=${encodeURIComponent(emailSubject)}` +
            `&body=${encodeURIComponent(emailBody)}`;

        if (formStatus) {
            formStatus.textContent =
                "Se abrirá tu aplicación de correo para completar el envío.";
        }

        /*
            No se muestra una confirmación falsa.
            El mensaje todavía debe enviarse desde el cliente de correo.
        */
        window.location.href = mailtoUrl;
    });
}


/* =========================================================
   7. VISUALIZACIÓN COMPLETA DE IMÁGENES
========================================================= */
function initializeImageLightbox() {
    const lightbox = document.querySelector("[data-image-lightbox]");
    const lightboxImage = document.querySelector("[data-lightbox-image]");
    const closeButtons = document.querySelectorAll("[data-lightbox-close]");
    const galleryImages = document.querySelectorAll(
        ".project-gallery__image:not([data-no-lightbox])"
    );

    if (!lightbox || !lightboxImage || galleryImages.length === 0) {
        return;
    }

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
