let dealOfferModalPageLoading = true;

window.addEventListener("DOMContentLoaded", function () {
  initDealOfferModals();
});

function initDealOfferModals() {
  // observer for touch devices
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.querySelector(".partner")) {
          // on touch devices, scrolling into view opens the 'partener' text
          entry.target.querySelector(".partner").classList.add("open");
        }
      });
    },
    {
      root: null,
      rootMargin: "0px",
      threshold: [0.8] // Trigger when 100% of the tile is visible
    }
  );

  // tab focus + enter key to open modal
  document.querySelectorAll("[data-open-deal-modal]").forEach((tile) => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      observer.observe(tile);
    }

    const id = tile.getAttribute("data-open-deal-modal");

    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.target.click();
      }
    });

    tile.addEventListener("mouseenter", (e) => {
      if (tile.querySelector(".partner")) {
        tile.querySelector(".partner").classList.add("open");
      }
    });

    tile.addEventListener("mouseleave", (e) => {
      const correspondingModal = document.getElementById(id);
      if (correspondingModal.classList.contains("is-open")) {
        return;
      }
      if (tile.querySelector(".partner")) {
        tile.querySelector(".partner").classList.remove("open");
      }
    });
  });

  MicroModal.init({
    openTrigger: "data-open-deal-modal",
    closeTrigger: "data-micromodal-close",

    onShow: function (modal) {
      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        document.body.classList.add("iOS-stop-body-scroll");
      } else {
        document.body.style.overflow = "hidden";
      }

      // reset scroll of modal__scroll-area to top
      if (modal.querySelector(".modal__scroll-area")) {
        modal.querySelector(".modal__scroll-area").scrollTop = 0;
      }
    },
    onClose: function (modal) {
      const correspondingTile = document.querySelector(
        `[data-open-deal-modal="${modal.id}"]`
      );
      if (correspondingTile.querySelector(".partner")) {
        correspondingTile.querySelector(".partner").classList.remove("open");
      }

      // reset scroll of modal__scroll-area to top
      if (modal.querySelector(".modal__scroll-area")) {
        modal.querySelector(".modal__scroll-area").scrollTop = 0;
      }
      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        document.body.classList.remove("iOS-stop-body-scroll");
      } else {
        document.body.style.overflow = "auto";
      }
    }
  });

  dealOfferModalPageLoading = false;
}
