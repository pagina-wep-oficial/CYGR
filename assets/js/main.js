document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 20);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const closeMenu = () => {
    if (!navToggle || !navMenu) return;
    navToggle.classList.remove("active");
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      navToggle.classList.toggle("active", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (!navMenu.classList.contains("open")) return;
      if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
        closeMenu();
      }
    });
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -35px" }
    );

    reveals.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
      revealObserver.observe(element);
    });
  } else {
    reveals.forEach((element) => element.classList.add("visible"));
  }

  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const galleryCards = Array.from(document.querySelectorAll(".gallery-card[data-category]"));

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      galleryCards.forEach((card) => {
        const categories = (card.dataset.category || "").split(" ");
        card.hidden = filter !== "all" && !categories.includes(filter);
      });
    });
  });

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const closeButton = lightbox?.querySelector(".lightbox-close");
  const previousButton = lightbox?.querySelector(".lightbox-prev");
  const nextButton = lightbox?.querySelector(".lightbox-next");
  let currentIndex = 0;
  let lastFocusedElement = null;

  const getVisibleItems = () =>
    Array.from(document.querySelectorAll("[data-lightbox]")).filter((item) => {
      const card = item.closest(".gallery-card");
      return !card || !card.hidden;
    });

  const showLightboxItem = (index) => {
    const visibleItems = getVisibleItems();
    if (!visibleItems.length || !lightboxImage || !lightboxCaption) return;

    currentIndex = (index + visibleItems.length) % visibleItems.length;
    const trigger = visibleItems[currentIndex];
    const image = trigger.querySelector("img");
    if (!image) return;

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = trigger.dataset.title || image.alt;

    const hasSeveralItems = visibleItems.length > 1;
    if (previousButton) previousButton.hidden = !hasSeveralItems;
    if (nextButton) nextButton.hidden = !hasSeveralItems;
  };

  const openLightbox = (trigger) => {
    if (!lightbox) return;
    const visibleItems = getVisibleItems();
    const index = visibleItems.indexOf(trigger);
    if (index < 0) return;

    lastFocusedElement = document.activeElement;
    showLightboxItem(index);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    closeButton?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lightboxImage) lightboxImage.src = "";
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  };

  document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
    trigger.addEventListener("click", () => openLightbox(trigger));
  });

  closeButton?.addEventListener("click", closeLightbox);
  previousButton?.addEventListener("click", () => showLightboxItem(currentIndex - 1));
  nextButton?.addEventListener("click", () => showLightboxItem(currentIndex + 1));

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closeLightbox();
    }

    if (!lightbox?.classList.contains("open")) return;
    if (event.key === "ArrowLeft") showLightboxItem(currentIndex - 1);
    if (event.key === "ArrowRight") showLightboxItem(currentIndex + 1);
  });
});
